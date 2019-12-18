// server.js
// where your node app starts

// init project
const fs = require('fs');
//Discord bot
const Discord = require('discord.js');
const moment = require('moment');
const client = new Discord.Client();
const {
  Client,
  RichEmbed
} = require('discord.js');
const bot = new Discord.Client();
const authkey = "NjU2NTE2MjQ3MjczNDcyMDIy.Xfj07g.EZSkkUoLcrpO9M375fo_SBGnAMc";
const discordconfig = JSON.parse(fs.readFileSync('./discordconf.json'));
let tickets = JSON.parse(fs.readFileSync('./tickets.json'));
let blocked = JSON.parse(fs.readFileSync('./blocked.json'));
let invitefile = JSON.parse(fs.readFileSync('./invite.json'));
let users = JSON.parse(fs.readFileSync('./users.json'));

bot.login(authkey);

const DiscordAntiSpam = require("discord-anti-spam");
const AntiSpam = new DiscordAntiSpam({
  warnThreshold: 3, // Amount of messages sent in a row that will cause a warning.
  banThreshold: 7, // Amount of messages sent in a row that will cause a ban
  maxInterval: 2000, // Amount of time (in ms) in which messages are cosidered spam.
  warnMessage: "{@user}, Please stop spamming.", // Message will be sent in chat upon warning.
  banMessage: "**{user_tag}** has been banned for spamming.", // Message will be sent in chat upon banning.
  maxDuplicatesWarning: 7, // Amount of same messages sent that will be considered as duplicates that will cause a warning.
  maxDuplicatesBan: 15, // Amount of same messages sent that will be considered as duplicates that will cause a ban.
  deleteMessagesAfterBanForPastDays: 1, // Amount of days in which old messages will be deleted. (1-7)
  exemptPermissions: ["MANAGE_MESSAGES", "ADMINISTRATOR", "MANAGE_GUILD", "BAN_MEMBERS"], // Bypass users with at least one of these permissions
  ignoreBots: true, // Ignore bot messages
  verbose: false, // Extended Logs from module
  ignoredUsers: [], // Array of string user IDs that are ignored
  ignoredRoles: [], // Array of string role IDs or role name that are ignored
  ignoredGuilds: [], // Array of string Guild IDs that are ignored
  ignoredChannels: [] // Array of string channels IDs that are ignored
});

AntiSpam.on("warnEmit", (member) => console.log(`Attempt to warn ${member.user.tag}.`));
AntiSpam.on("warnAdd", (member) => console.log(`${member.user.tag} has been warned.`));
AntiSpam.on("kickEmit", (member) => console.log(`Attempt to kick ${member.user.tag}.`));
AntiSpam.on("kickAdd", (member) => console.log(`${member.user.tag} has been kicked.`));
AntiSpam.on("banEmit", (member) => console.log(`Attempt to ban ${member.user.tag}.`));
AntiSpam.on("banAdd", (member) => console.log(`${member.user.tag} has been banned.`));
AntiSpam.on("dataReset", () => console.log("Module cache has been cleared."));

////////Discord bot////////
//Discord bot bootup :)
bot.on("ready", () => {
  setInterval(RemoveTickets, 60000)
  console.log(' -> Bot ready with ' + bot.users.size + ' users online!');
  bot.user.setActivity("watching users");

  bot.on('guildMemberAdd', member => {
    console.log("New user joined the server :) ")
    bot.guilds.get("649377472432963606").fetchInvites().then(invites => {
      fs.readFile('invite.json', function (err, data) {
        var json = JSON.parse(data);
        const userInvites = invites.array();
        var index = 0;
        while (index < userInvites.length) {
          console.log(userInvites[index].inviter.id);
          var index2 = 0;
          var foundcode = false;
          while (index2 < json.invites.length) {
            if (json.invites[index2].invitecode == userInvites[index].code) {
              foundcode = true;
              if (json.invites[index2].Uses != userInvites[index].uses) {
                console.log("Someone joined with the code: " + userInvites[index].code);
                bot.channels.get("649379407705931781").send("Welcome <@" + member.user.id + "> to " + member.guild.name + " with using the invite code from: <@" + json.invites[index2].Author + ">  has " + json.invites[index2].Uses + " uses, and " + json.invites[index2].Leaves + " that left. Your total Invites now is " + (json.invites[index2].Uses - json.invites[index2].Leaves))
                json.invites[index2].Uses = userInvites[index].uses;
                users = JSON.parse(fs.readFileSync('./users.json'));
                var users_json = users;
                var found_users = false;
                for (var i = 0; i < users_json.length; i++) {
                  if (users_json[i].userid.toString() == member.user.id.toString()) {
                    users_json[i].code = userInvites[index].code;
                    found_users = true;
                  }
                }
                if (!found_users) {
                  var user = {
                    userid: member.user.id,
                    code: userInvites[index].code,
                  };
                  users_json.push(user);

                }
                fs.writeFileSync("users.json", JSON.stringify(users_json, null, 4));
                break;
              }
            }
            index2++;
          }
          if (foundcode == false) {
            var userdata = {
              invitecode: userInvites[index].code,
              Author: userInvites[index].inviter.id,
              Uses: userInvites[index].uses,
              Leaves: 0
            };
            json["invites"].push(userdata);
          }
          index++;
        }
        fs.writeFileSync("invite.json", JSON.stringify(json, null, 4));
      })
    })

  })

  bot.on('guildMemberRemove', member => {
    console.log("User left the server")
    users = JSON.parse(fs.readFileSync('./users.json'));
    var users_json = users;
    invitefile = JSON.parse(fs.readFileSync('./invite.json'));
    for (var i = 0; i < users_json.length; i++) {
      if (users_json[i].userid == member.user.id) {
        for (var index = 0; index < invitefile.invites.length; index++) {
          if (invitefile.invites[index].invitecode == users_json[i].code) {
            invitefile.invites[index].Leaves++;
          }
        }
      }
    }
    fs.writeFileSync("invite.json", JSON.stringify(invitefile, null, 4));
  })
});

//Discord command listener//

bot.on("message", async message => {
  var msg = message.content.toUpperCase();
  if (message.author.bot) return;
  if (message.channel.type === "dm") return message.channel.send({
    embed: {
      color: 0xff0000,
      description: `I am hatching dino's:japanese_goblin:`,
      title: "Rawr"
    }
  }).then(msg => {

    msg.react("👺")
  })
  //AntiSpam.message(message);
  for (var i = 0; i < blocked.links.length; i++) {
    if (message.content.includes(blocked.links[i])) {
      //message.author.send("Do not post links please..")
      message.delete(1).catch()
    }
  }
  if (message.content.indexOf(discordconfig.prefix) !== 0) return;

  const args = message.content.slice(discordconfig.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  if (command == "ticket") {
    let messagetext = args.slice(0).join(" ");
    if (messagetext == "") {
      messagetext = "No description given";
    }
    var length = parseInt(tickets.length)
    length++;
    var name = "📧 - " + length;
    jsonfile = fs.readFileSync('./tickets.json');
    json = JSON.parse(jsonfile);
    message.guild.createChannel(name, 'text').then(m => {
      const user = {
        creator: message.author.id,
        creationtime: GetCurrentDate(),
        status: "open",
        channelid: m.id,
        closing_date: GetCurrentDate(),
        close_reason: "None"
      }
      json.push(user);
      let data = JSON.stringify(json, null, 4);
      fs.writeFileSync('./tickets.json', data);
      tickets = JSON.parse(fs.readFileSync('./tickets.json'));
      let category = bot.channels.find(c => c.name == "tickets" && c.type == "category");
      if (!category) throw new Error("Category channel does not exist");
      m.setParent(category.id);
      let botembed = new RichEmbed();
      botembed.setDescription("Ticket created")
      botembed.setColor(GetRandomColour())
      botembed.setThumbnail("https://i.imgur.com/qGVu34z.png")
      botembed.addField("Ticket message", messagetext)
      botembed.addField("Ticket channel", "<#" + m.id + ">")
      botembed.setFooter("Version 1.0")
      message.channel.send(botembed)

      let botembed2 = new RichEmbed();
      botembed2.setDescription("Ticket created")
      botembed2.setColor(GetRandomColour())
      botembed2.setThumbnail("https://i.imgur.com/qGVu34z.png")
      botembed2.addField("Ticket message", messagetext)
      botembed2.setFooter("Version 1.0")
      m.send(botembed2)
      m.overwritePermissions(message.guild.id, {
        VIEW_CHANNEL: false
      })

      m.overwritePermissions(message.author.id, {
        VIEW_CHANNEL: true
      })
      let myRole = message.guild.roles.find(role => role.name === "Server Staff");
      m.overwritePermissions(myRole, {
        VIEW_CHANNEL: true
      });

    })
    //channel.delete()
  }

  if (command == "reopen") {
    jsonfile = fs.readFileSync('./tickets.json');
    json = JSON.parse(jsonfile);
    let openreason = args.slice(0).join(" ");
    if (openreason == "") {
      openreason = "No reason given";
    }
    for (var i = 0; i < json.length; i++) {
      if (json[i].channelid == message.channel.id) {
        json[i].status = "open";
        let botembed = new RichEmbed();
        botembed.setDescription("Ticket status")
        botembed.setColor(GetRandomColour())
        botembed.setThumbnail("https://i.imgur.com/qGVu34z.png")
        botembed.addField("Status", "Re-opened")
        botembed.addField("Re0open reason", openreason)
        botembed.setFooter("Version 1.0")
        message.channel.send(botembed)
      }
    }
    let data = JSON.stringify(json, null, 4);
    fs.writeFileSync('./tickets.json', data);
  }

  if (command == "rename") {
    let channelname = args.slice(0).join(" ");
    var found = false;
    jsonfile = fs.readFileSync('./tickets.json');
    json = JSON.parse(jsonfile);
    for (var i = 0; i < json.length; i++) {
      if (json[i].channelid == message.channel.id) {
        found = true;
        if (channelname == "") {
          return message.channel.send("Please use !rename NEWCHANNELNAME");
        }
        message.channel.setName("📧 - " + channelname)
      }
    }
    if (!found) {
      return message.channel.send("You can only use this command in a ticket channel!")
    }
  }

  if (command == "forceremove") {
    jsonfile = fs.readFileSync('./tickets.json');
    json = JSON.parse(jsonfile);
    for (var i = 0; i < json.length; i++) {
      if (json[i].channelid == message.channel.id) {
        try {
          bot.channels.get(json[i].channelid).delete();
          console.log("Removed channel: " + json[i].channelid);
        } catch (error) {
          console.log("Failed removing the channel: " + json[i].channelid + " Error:" + error);
          message.channel.send("Failed removing the channel: " + json[i].channelid + " Error:" + error);
        }
        json[i].status = "closed";
      }
    }
    let data = JSON.stringify(json, null, 4);
    fs.writeFileSync('./tickets.json', data);
  }


  if (command == "close") {
    jsonfile = fs.readFileSync('./tickets.json');
    json = JSON.parse(jsonfile);
    let closereason = args.slice(0).join(" ");
    if (closereason == "") {
      closereason = "No reason given.";
    }
    closereason = closereason + " Closed by: <@" + message.author.id + ">"
    for (var i = 0; i < json.length; i++) {
      if (json[i].channelid == message.channel.id) {
        json[i].status = "closing";
        json[i].closing_date = GetCurrentDate();
        json[i].close_reason = closereason;
        let botembed = new RichEmbed();
        botembed.setDescription("Ticket status")
        botembed.setColor(GetRandomColour())
        botembed.setThumbnail("https://i.imgur.com/qGVu34z.png")
        botembed.addField("Status", "Closing")
        botembed.addField("Close reason", closereason)
        botembed.setFooter("Version 1.0")
        message.channel.send(botembed)
        bot.users.get(json[i].creator).send(botembed);
      }
    }
    let data = JSON.stringify(json, null, 4);
    fs.writeFileSync('./tickets.json', data);
  }

  if (command == "status") {
    var channel = args[0];
    if (channel == undefined || channel == "undefined") {
      channel = message.channel.id;
    }
    jsonfile = fs.readFileSync('./tickets.json');
    json = JSON.parse(jsonfile);
    for (var i = 0; i < json.length; i++) {
      if (json[i].channelid == channel) {
        let botembed = new RichEmbed();
        botembed.setDescription("Ticket status")
        botembed.setColor(GetRandomColour())
        botembed.setThumbnail("https://i.imgur.com/qGVu34z.png")
        botembed.addField("Creator", "<@" + json[i].creator + ">")
        botembed.addField("Creation time", json[i].creationtime)
        botembed.addField("Status", json[i].status)
        if (json[i].status == "closed" || json[i].status == "closing") {
          botembed.addField("Close reason", json[i].close_reason)
          botembed.addField("Close date", json[i].closing_date)
        }
        botembed.setFooter("Version 1.0")
        message.channel.send(botembed)
      }
    }
  }


})

////////Extra Functions////////

function RemoveTickets() {
  console.log("Scanning for tickets to remove...");
  jsonfile = fs.readFileSync('./tickets.json');
  json = JSON.parse(jsonfile);
  for (var i = 0; i < json.length; i++) {
    console.log(moment().valueOf() - moment(json[i].closing_date, 'YYYY-MM-DD HH:mm:ss').valueOf() + " " + json[i].channelid)
    if (json[i].status == "closing" && moment().valueOf() - moment(json[i].closing_date, 'YYYY-MM-DD HH:mm:ss').valueOf() >= 86428436) {
      try {
        bot.channels.get(json[i].channelid).delete()
        console.log("Removed channel: " + json[i].channelid)
      } catch (error) {
        console.log("Failed removing the channel: " + json[i].channelid)
      }
      json[i].status = "closed";
    }
  }
  let data = JSON.stringify(json, null, 4);
  fs.writeFileSync('./tickets.json', data);
  console.log("Removed all tickets...");
}

function GetRandomColour() {
  var randomcolour = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
  return randomcolour;
}

function GetCurrentDate() {
  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);

  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // current year
  let year = date_ob.getFullYear();

  // current hours
  let hours = date_ob.getHours();

  // current minutes
  let minutes = date_ob.getMinutes();

  // current seconds
  let seconds = date_ob.getSeconds();

  return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}
