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
			description: `**Synopsis : **\n\n${anime.attributes.synopsis.split('[')[0].split('(Source')[0]}`,
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
			for(var i = 0; i < animesList.length; i++){
				await postedMessage.react(numberInEmojiUnicodeUntilTen(i+1));
			}
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
				console.log(response.data.data);
				if(response.data.data.length > 0) {
					console.log(response.data.data[0]);
					showListOfAnime(msg,response.data.data);
					//sendAnimeInfos(msg,response.data.data[0]);
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