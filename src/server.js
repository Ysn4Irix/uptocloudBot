require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
  secure: true,
});

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {
  polling: true,
});

const SupportedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
];

bot.onText(/\/start/, (msg) => {
  const { chat } = msg;
  bot.sendMessage(
    chat.id,
    "Hi! ✋ Welcome to <strong>UptoCloud</strong> I will upload images or videos to cloudinary and send you the File URL \nJust send me an image or video as <b>Document</b>",
    {
      parse_mode: "HTML",
    }
  );
});

bot.on("document", async (msg, match) => {
  const { chat, document } = msg;

  if (!SupportedTypes.includes(document.mime_type)) {
    bot.sendMessage(
      chat.id,
      "🛑 Use one of the supported types: JPEG, JPG, PNG, SVG"
    );
    return;
  }

  const fileLink = await bot.getFileLink(document.file_id);

  bot
    .sendMessage(chat.id, "<b>Processing please wait...</b>", {
      parse_mode: "HTML",
    })
    .then(() => {
      cloudinary.api
        .create_folder(`/${chat.username}`)
        .then(() => {
          cloudinary.v2.uploader
            .upload(fileLink, {
              folder: chat.username,
            })
            .then((result) => {
              bot.sendMessage(
                chat.id,
                `<b>✔️ File Uploaded !</b>\n${result.secure_url}`,
                {
                  parse_mode: "HTML",
                }
              );
            })
            .catch((err) => {
              bot.sendMessage(
                chat.id,
                "<b>There is a error on our backend 😢</b>",
                {
                  parse_mode: "HTML",
                }
              );
            });
        })
        .catch(() => {
          bot.sendMessage(
            chat.id,
            "<b>There is a error on our backend 😢</b>",
            {
              parse_mode: "HTML",
            }
          );
        });
    });
});
