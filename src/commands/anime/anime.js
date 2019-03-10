const KitsuAPI = require('../../services/kitsu-api');
const refactorDate = require('../../methods/refactorDate');
const refactorDateWithTime = require('../../methods/refactorDateWithTime');
const strUcFirst = require('../../methods/strUcFirst');
const numberInEnglishUntilTen = require('../../methods/numberInEnglishUntilTen');
const numberInEmojiUnicodeUntilTen = require('../../methods/numberInUnicodeEmojiUntilTen');

function getAnimeInfos(anime) {
	const infosFields = [];

	infosFields.push({
		name: 'Start Date :calendar_spiral:',
		value: anime.attributes.startDate != null ? refactorDate(anime.attributes.startDate) : 'Unknown',
		inline: anime.attributes.endDate != null,
	});

	if(anime.attributes.endDate != null) {
		infosFields.push({
			name: 'End Date :calendar_spiral:',
			value: refactorDate(anime.attributes.endDate),
			inline: true,
		});
	}

	infosFields.push({
		name: 'Status :white_check_mark:',
		value: strUcFirst(anime.attributes.status),
		inline: (anime.attributes.nextRelease != null || anime.attributes.episodeCount != null),
	});

	if(anime.attributes.status === 'current' && anime.attributes.nextRelease != null) {
		infosFields.push({
			name: 'Next episode :date:',
			value: refactorDateWithTime(anime.attributes.nextRelease),
			inline: true,
		});
	}

	if(anime.attributes.episodeCount != null) {
		infosFields.push({
			name: 'Episode Count',
			value: anime.attributes.episodeCount,
			inline: true,
		});
	}

	if(anime.attributes.youtubeVideoId != null) {
		infosFields.push({
			name: 'Youtube video :arrow_forward:',
			value: `[Click here](https://www.youtube.com/watch?v=${anime.attributes.youtubeVideoId})`,
		});
	}

	infosFields.push({
		name: 'Rating :star:',
		value: `${anime.attributes.averageRating}/100`,
		inline: true,
	});

	infosFields.push({
		name: 'Content Rating :underage:',
		value: `${anime.attributes.ageRatingGuide}`,
		inline: true,
	});

	return infosFields;
}

function sendAnimeInfos(msg,anime) {
	msg.channel.send({
		embed: {
			title: `:flag_gb: ${anime.attributes.titles.en_jp}\n:flag_jp: ${anime.attributes.titles.ja_jp}`,
			image: {
				url: `${anime.attributes.coverImage != null ? anime.attributes.coverImage.original : ''}`,
			},
			thumbnail: {
				url: `${anime.attributes.posterImage != null ? anime.attributes.posterImage.original : ''}`,
			},
			fields: getAnimeInfos(anime),
			description: `**Synopsis : **\n${anime.attributes.synopsis.split('[')[0].split('(Source')[0]}\n`,
		},
	});
	
}

function getAnimesListInfos(animesList){
	const animesFields = [];
	for(var i = 0; i < animesList.length; i++){
		animesFields.push({
			name: ` :${i!=9 ? numberInEnglishUntilTen(i+1):`keycap_${numberInEnglishUntilTen(i+1)}`}: `,
			value: `${animesList[i].attributes.titles.en_jp} `,
		});
	}
	animesFields.push({
		name: 'Please react with the emoji corresponding to the anime you want to know more about',
		value: `Example : React with emoji ${numberInEmojiUnicodeUntilTen(1)} to know more about '**${animesList[0].attributes.titles.en_jp}**'`,
	})
	return animesFields;
}

function showListOfAnime(msg,animesList){
	msg.channel.send({
		embed: {
			title: 'List of animes corresponding to the research',
			fields: getAnimesListInfos(animesList),
		},
	}).then(async postedMessage => {
		try {
			const filter = (reaction,user) => {
				const emojiAccepted = [];
				for(var i = 0; i < animesList.length; i++){
					emojiAccepted.push(numberInEmojiUnicodeUntilTen(i+1));
				}
				return emojiAccepted.includes(reaction.emoji.name) && user.id === msg.author.id;
			};
			postedMessage.awaitReactions(filter, {max: 1, time: 60000, errors:['time'] })
				.then(collected => {
					const reaction = collected.first();
		
					switch(reaction.emoji.name){
						case numberInEmojiUnicodeUntilTen(1) :
							sendAnimeInfos(msg,animesList[0]);
							break;
						case numberInEmojiUnicodeUntilTen(2) :
							sendAnimeInfos(msg,animesList[1]);
							break;
						case numberInEmojiUnicodeUntilTen(3) :
							sendAnimeInfos(msg,animesList[2]);
							break;
						case numberInEmojiUnicodeUntilTen(4) :
							sendAnimeInfos(msg,animesList[3]);
							break;
						case numberInEmojiUnicodeUntilTen(5) :
							sendAnimeInfos(msg,animesList[4]);
							break;
						case numberInEmojiUnicodeUntilTen(6) :
							sendAnimeInfos(msg,animesList[5]);
							break;
						case numberInEmojiUnicodeUntilTen(7) :
							sendAnimeInfos(msg,animesList[6]);
							break;
						case numberInEmojiUnicodeUntilTen(8) :
							sendAnimeInfos(msg,animesList[7]);
							break;
						case numberInEmojiUnicodeUntilTen(9) :
							sendAnimeInfos(msg,animesList[8]);
							break;
						case numberInEmojiUnicodeUntilTen(10) :
						sendAnimeInfos(msg,animesList[9]);
						break;
						default : msg.reply('unknown reaction');
					}
				}).catch(collected => {
					console.error(collected);
					msg.reply('you didn\'t react with an allowed reaction in time. Please retry the command and react in time by following instructions.')
				});
		} catch (error) {
			console.error('One of the emojis failed to react.');
		}
	});
	
}

exports.exec = (bot, msg, args) => {
	const Kitsu = new KitsuAPI();
	Kitsu.findByAnimeName(args.join(' '))
		.then(response => {
			if(response.status == 200) {
				if(response.data.data.length > 0) {
					showListOfAnime(msg,response.data.data);
				}
				else {
					msg.channel.send('**No results found. Maybe retry with another name...**');
				}
			}
			else {
				msg.channel.send('**Error while retrieving anime information');
				console.error(response);
			}
		}
		);
};

exports.config = {
	enabled: true,
};