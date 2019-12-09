// require the discord.js module
var fs = require('fs');
const Discord = require('discord.js');

// create a new Discord client
const client = new Discord.Client();

let previousUserStatuses = {};
var userstatuses = {};

/*

*/
var trackMode = 0;

// this
var trackEveryone = true;
// or
var trackFriends = false;
var trackFromList = true;
var trackedList = [
];

var trackThese = []
function makeBlankEvent()
{
  return {
    timestamp_ms: Math.floor(Date.now())
  };
}
function checkStatuses(client)
{
    previousUserStatuses = userstatuses;
    var max_guilds = client.guilds.size;
    var guilds_done = 0;

    var updateEvents = {}

    client.guilds.forEach((g) => {
      var presence_count = g.presences.size;
      var presences_done = 0;
      g.presences.forEach(async (p, id) => {



        var u = await client.fetchUser(id);

        var ustat = {
          guildid: [g.id],
          user: u,
          status: p.status,
          clientStatus: p.clientStatus,
          lastMessageID: u.lastMessageID
        }

        if (userstatuses[u.id]) {

          // EVENT: username change
          if (userstatuses[u.id].user.username != ustat.user.username)
          {
            if (!updateEvents[id]) updateEvents[id] = makeBlankEvent();
            updateEvents[id].username = {
              previous: userstatuses[u.id].user.username,
              current: ustat.user.username
            }
          }

          // EVENT: discriminator change
          if (userstatuses[u.id].user.discriminator != ustat.user.discriminator)
          {
            if (!updateEvents[id]) updateEvents[id] = makeBlankEvent();
            updateEvents[id].username = {
              previous: userstatuses[u.id].user.discriminator,
              current: ustat.user.discriminator
            }

          }

          // EVENT: Message
            if (ustat.user.lastMessageID != userstatuses[u.id].lastMessageID)
            {
              var lastMsg = {
                createdAt: ustat.user.lastMessage.createdTimestamp,
                channel: ustat.user.lastMessage.channel.id,
                id: ustat.lastMessageID
              }
              if (!updateEvents[id]) updateEvents[id] = makeBlankEvent();
              updateEvents[id].lastMessage = lastMsg;

              userstatuses[u.id].lastMessageID = ustat.user.lastMessageID
            }

          // EVENT: status change
          if (userstatuses[u.id].status != ustat.status)
          {
              if (!updateEvents[id]) updateEvents[id] = makeBlankEvent();

              //console.log(ustat.user.username + ': ' + userstatuses[u.id].status + ' -> ' + ustat.status);

              updateEvents[id].status = {
                previous: userstatuses[u.id].status,
                current: ustat.status
              }
              userstatuses[u.id].status = p.status;
            }

            userstatuses[u.id].user = ustat.user;
            userstatuses[u.id].clientStatus = p.clientStatus;


          } else {
            userstatuses[u.id] = ustat;
          }
        presences_done += 1;
      })

      var checkPresencesDone = setInterval(function() {
        if (presence_count == presences_done){
              clearInterval(checkPresencesDone);
              guilds_done += 1;
              //compareStatuses(previousUserStatuses, userstatuses);
         }
      }, 1);
    })
    var checkGuildsDone = setInterval(function() {
      if (max_guilds == guilds_done){
            clearInterval(checkGuildsDone);
            //console.log(updateEvents)

            // Create empty log file if none

            // Append to log
            Object.keys(updateEvents).forEach(function(k) {
              if (client.user.id == k) return;

              var e = updateEvents[k];

              trackThese = []
              if (trackEveryone)
              {
                console.log(e);
              } else {
                if (trackFriends)
                {
                  if (trackFriends) {
                    client.user.friends.forEach(f => {
                      trackThese.push(f.id);
                    })
                  }
                }
                if (trackFromList) {
                  trackThese = trackThese.concat(trackedList)

                }
                if (trackThese.includes(k))
                {
                  console.log(e);
                }
              }

            })
       }
    }, 1);
}
/*
function compareStatuses(prev, current) {

  if (!prev) return;
  if (!current) return;
  Object.keys(current).forEach(function(k, i) {
    var stat = current[k];
    var prevstat = prev[k];

    if (!stat) return;
    if (!prevstat) return;

    var joinedGuilds = [];
    var leftGuilds = [];
    var guildsChanged = false;
    stat.guildid.forEach(gid => {
      if (!prevstat.guildid.includes(gid)) {
        joinedGuilds.push(gid);
        guildsChanged = true;
      }
    })
    prevstat.guildid.forEach(gid => {
      if (!stat.guildid.includes(gid)) {
        leftGuilds.push(gid);
        guildsChanged = true;
      }
    })

    var statusChanged = prevstat.status != stat.status;
    var desktopStatusChange = prevstat.clientStatus.desktop != stat.clientStatus.desktop;
    var webStatusChange = prevstat.clientStatus.web != stat.clientStatus.web;
    var mobileStatusChange = prevstat.clientStatus.mobile != stat.clientStatus.mobile;
    var usernameChange = prevstat.user.username != stat.user.username;
    var discriminatorChange = prevstat.user.discriminator != stat.user.discriminator;
    var avatarChange = prevstat.user.avatar != stat.user.avatar;

    var update = {
      previousStatus: prevstat,
      currentStatus: stat,
      timestamp_ms: Math.floor(Date.now()),
      events: {
        guildsChanged: guildsChanged,
        joinedGuilds: joinedGuilds,
        leftGuilds: leftGuilds,
        statusChanged: statusChanged,
        desktopStatusChange: desktopStatusChange,
        webStatusChange: mobileStatusChange,
        mobileStatusChange: mobileStatusChange,
        usernameChange: usernameChange,
        discriminatorChange: discriminatorChange
      }
    }

    var changed = (
      update.events.guildsChanged ||
      update.events.statusChanged ||
      update.events.webStatusChange ||
      update.events.mobileStatusChange ||
      update.events.mobileStatusChange ||
      update.events.usernameChange ||
      update.events.discriminatorChange
    )
  })

}
*/
// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Logged in as ' + client.user.tag);

  // Set up tracked list
  setInterval(checkStatuses, 2000, client)

});

// login to Discord with your app's token
client.login('token');
