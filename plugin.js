const axios = require("axios");
const fs = require("fs").promises;
const child_process = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const { unlink } = require('fs').promises;

// Define a function to pause execution for a specified number of milliseconds
const sleepy = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Define a function to fetch a resource as a buffer
const getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (err) {
    return err;
  }
}

// Define a function to convert a GIF to MP4 format
const bufferGifToMp4 = async (image) => {
  const filename = `${Math.random().toString(36)}`;
  await fs.writeFile(`./BotMedia/trash/${filename}.gif`, image);
  child_process.execSync(
    `ffmpeg -i ./BotMedia/trash/${filename}.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ./BotMedia/trash/${filename}.mp4`,
  );
  await sleepy(4000);
  const buffer5 = await fs.readFile(`./BotMedia/trash/${filename}.mp4`);
  await Promise.all([
    fs.unlink(`./BotMedia/trash/${filename}.mp4`),
    fs.unlink(`./BotMedia/trash/${filename}.gif`),
  ]);
  return buffer5;
};

module.exports = {
  name: "spank",
  category: "gifs",
  desc: "Playfully spank someone with a GIF",
  async exec(conn, m, args, icmd) {
    const text = args.join(" ");

    let users = m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.quoted
      ? m.quoted.sender
      : text.replace(/[^0-9]/g, "");

    try {
      if (!users) {
        m.reply("Please mention or provide the name of the person you want to playfully spank.");
      } else {
        const assss = await axios.get(
          "https://apiservice1.kisara.app/satou/api/endpoint/spank",
        );
        const bobuff = await getBuffer(assss.data.url);
        const bogif = await bufferGifToMp4(bobuff);
        const cap = `@${m.sender.split("@")[0]} playfully spanks @${users.split("@")[0]}'s ass`;
        await conn.sendMessage(
          m.chat,
          {
            caption: cap,
            video: bogif,
            gifPlayback: true,
            mentions: [m.sender, users],
          },
          { quoted: m },
        ).catch((err) => {});
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },
};

