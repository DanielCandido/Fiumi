require("dotenv").config();
const TOKEN = process.env.TOKEN;
require("./register-commands");
const getMovies = require("./actions/get-movies");

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const embed = new EmbedBuilder({});
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("", (message) => console.log(message));

client.on("interactionCreate", async (interaction) => {
  const command = interaction.commandName;
  let items;

  if (command === "find") {
    const itemName = interaction?.options?.data[0]?.value;

    if (!itemName) {
      await interaction.reply("Nome não fornecido.");
      return;
    }

    try {
      await interaction.reply("Procurando items");
      items = await getMovies(itemName);

      if (items === null) {
        await interaction.channel.send("Item não encontrado");
        return;
      }
    } catch (err) {
      console.log(err);
      await interaction.channel.send("error searching itens");
      return;
    }

    try {
      const embeds = [];
      for (let i = 0; i < items.length; i++) {
        const embed = new EmbedBuilder();

        embed.setTitle(items[i].name);
        embed.setFields([
          {
            name: "Ano",
            value: `${items[i].year ? items[i].year : "Sem informações"}`,
            inline: true,
          },
          {
            name: "Onde assistir",
            value: `${items[i].waysToWatch}`,
            inline: true,
          },
        ]);

        if (items[i].image) {
          embed.setImage(items[i].image);
        }

        embeds.push(embed);
      }

      await interaction.channel.send({
        embeds,
        target: interaction,
        body: { embeds },
      });

      return;
    } catch (err) {
      console.log(err);
      await interaction.channel.send("Erro ao gerar informações");
    }
  }

  await interaction.reply("Ok");
});

client.login(TOKEN);
