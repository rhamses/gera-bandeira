const functions = require("firebase-functions");
const {CloudTasksClient} = require("@google-cloud/tasks");
const {subSeconds} = require("date-fns");
const {zonedTimeToUtc} = require("date-fns-tz");
const {parse, stringify} = require("svgson");
const {convert} = require("convert-svg-to-png");
const {TwitterApi} = require("twitter-api-v2");
const fs = require("fs");

const TwitterClient = new TwitterApi({
  appKey: "VZEKizlIR2Rk5y5LxLHsxwqD5",
  appSecret: "tlxPjBOKxHjf26xrKoXjTefD3ZnFDzvUj6GMwA37dh7fzrZ1hT",
  accessToken: "1414756467438231553-xspCkIIHjRmoZ7krvvHB30IbUCyTez",
  accessSecret: "ULQaleSbhOLewdeJkrQTruPm7P9y4oVLxRplOTY8WEY0T",
});

/**
* Recebe o Tweet e trata de acordo com os filtros abaixo.
* Exemplos de interação:
* - @lemadobrasil frase com até 25 carácteres
* - @lemadobrasil faça isso "frase com 25 carácteres"
* - @lemadobrasil tuíte COM LIMTITE DE CARÁTER 25 ITENS
* @param {string} Phrase Frase requisitado pelo cliente.
* @return {string}
*/
function getPhrase(Phrase) {
  try {
    const rules = {
      allCaps: new RegExp("([A-Z]+)", "gm"),
      quoted: new RegExp("(\".*?\")", "gmi"),
    };
    if (Phrase.match(rules.allCaps) &&
    Phrase.match(rules.allCaps)[0].split("").length > 3) {
      Phrase = Phrase.match(rules.allCaps).join("");
    } else if (Phrase.match(rules.quoted)) {
      Phrase = Phrase.match(rules.quoted)[0].replaceAll("\"", "")
          .substring(0, 21);
    } else {
      Phrase = Phrase.replace("@lemadobrasil", "").trim().substring(0, 21);
    }
    return Phrase;
  } catch (error) {
    console.log(error);
    return null;
  }
}
/**
* Monta um base64 com uma frase.
* @param {string} Phrase Frase requisitado pelo cliente.
* @return {Buffer}
*/
async function createFlag(Phrase) {
  try {
    const flag = fs.readFileSync("./flag.svg", "utf8").toString();
    const svgObj = await parse(flag);
    const textNode = svgObj.children.find((prop) => prop.name == "text");
    textNode.children[0].children[0].value = Phrase;
    const newImage = stringify(svgObj);
    const pngImage = await convert(newImage);
    return pngImage;
  } catch (error) {
    functions.logger.error(error, {structuredData: true});
    return null;
  }
}
/**
* Recebe um BUFFER de imagem e faz o upload para o Twitter.
* Em seguida sobe um texto alternativo para a ilustração da imagem.
* @param {string} image Buffer da imagem para ser feito o upload.
* @param {string} text Frase requisitado pelo cliente
* @return {string}
* @return {boolean}
*/
async function uploadImage(image, text) {
  try {
    const mediaID = await TwitterClient.v1.uploadMedia(image, {
      mimeType: "EUploadMimeType.Png",
    });
    await TwitterClient.v1.createMediaMetadata(mediaID, {
      alt_text: {
        text: `Bandeira do Brasil com o lema escrito "${text.toUpperCase()}"`,
      },
    });
    return mediaID;
  } catch (error) {
    console.log(error);
    return null;
  }
}
/**
* Posta um tweet com uma imagem em anexa ( ou nao )
* @param {string} mediaID é o id da imagem para fazer anexo
* @param {string} tweet A frase de resposta para ser inserida no Tweet
* @param {boolean} reply Uma flag para identificar se o tweet é resposta ou Não
* @param {string} tweetID O Id do tweet para ser respondido
* @return {object}
*/
async function postTweet(
    mediaID = null,
    tweet = "",
    reply = false,
    tweetID = null) {
  try {
    const config = {};
    let tweet;
    if (mediaID) {
      config.media = {
        media_ids: [mediaID],
      };
    }
    if (reply) {
      const {data: createdTweet} = await TwitterClient.v2.reply(
          tweet,
          tweetID,
          {...config});
      tweet = createdTweet;
    } else {
      const {data: createdTweet} = await TwitterClient.v2.tweet(
          tweet,
          {...config});
      tweet = createdTweet;
    }
    return tweet;
  } catch (error) {
    console.log(error);
    return null;
  }
}
/**
* Processa a imagem
* @param {string} tweet A frase de resposta para ser inserida no Tweet
* @return {object}
*/
async function postaBandeira(tweet) {
  if (tweet) {
    const text = getPhrase(tweet.text);
    const image = await createFlag(text);
    const imageId = await uploadImage(image, text);
    const result = await postTweet(
        imageId,
        `Você pediu e está aí a bandeira escrita "${text.toUpperCase()}"`,
        true,
        tweet.id);
    return result;
  } else {
    return null;
  }
}
exports.geraBandeira = functions
    .region("southamerica-east1")
    .https.onRequest(async function(request, response) {
      const text = getPhrase(request.body.text);
      const image = await createFlag(text);
      response.send(`<img src="data:image/png;base64,${image.toString("base64")}">`);
    });
exports.processaTask = functions
    .region("southamerica-east1")
    .https.onRequest(async function(request, response) {
      functions.logger.info(request.body);
      const tweet = await postaBandeira(request.body.tweet);
      response.send(tweet);
    });
exports.loadMentions = functions
    .region("southamerica-east1")
    .https.onRequest(async (request, response) => {
      try {
        const tweets = [];
        const twitterID = "1414756467438231553";
        const secondsInterval = 60;
        const config = {
          start_time: zonedTimeToUtc(
              subSeconds(new Date(), secondsInterval), "UTC",
          ).toISOString(),
          end_time: zonedTimeToUtc(new Date(), "UTC").toISOString(),
        };
        const {_realData: {data}} = await TwitterClient.v2.userMentionTimeline(
            twitterID,
            config);
        const projectId = "gera-bandeira";
        const location = "southamerica-east1";
        const queue = "processarbandeira";
        const tasksClient = new CloudTasksClient();
        const queuePath = tasksClient.queuePath(projectId, location, queue);
        const url = "https://southamerica-east1-gera-bandeira.cloudfunctions.net/processaTask";
        const delaySecondsBase = 5;
        if (data) {
          for (const [index, item] of data.entries()) {
            const delaySeconds = delaySecondsBase * (index + 1);
            const data = Buffer
                .from(JSON.stringify({tweet: item}))
                .toString("base64");
            const task = {
              httpRequest: {
                httpMethod: "POST",
                url,
                body: data,
                headers: {
                  "Content-Type": "application/json",
                },
              },
              scheduleTime: {
                seconds: delaySeconds,
              },
            };
            const [response] = await tasksClient.createTask({
              parent: queuePath,
              task,
            });
            tweets.push(response);
          }
        }
        response.send(tweets);
      } catch (error) {
        functions.logger.error(error);
        response.send({error: "true"});
      }
    });
