exports.exec = (bot, msg) => {
	msg.channel.send(`
Commands available:
 - help
 - join
 - play
 - dc
 - skip
 - list
 - purge
    `);
};

exports.config = {
	enabled: true,
};