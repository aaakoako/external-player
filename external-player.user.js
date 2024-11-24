// ==UserScript==
// @name                    External Player
// @name:zh-CN              外部播放器
// @namespace               https://github.com/LuckyPuppy514/external-player
// @copyright               2024, Grant LuckyPuppy514 (https://github.com/LuckyPuppy514)
// @version                 1.0.0
// @description             Play web video via external player
// @description:zh-CN       使用外部播放器播放网页中的视频
// @icon                    https://www.lckp.top/gh/LuckyPuppy514/pic-bed/common/mpv.png
// @author                  LuckyPuppy514
// @homepage                https://github.com/LuckyPuppy514/external-player
// @updateURL
// @downloadURL
// @include                 *://*
// @grant                   GM_setValue
// @grant                   GM_getValue
// @run-at                  document-end
// @require                 https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-y/pako/2.0.4/pako.min.js
// ==/UserScript==

'use strict';

const SETTING_URL = undefined;
// const SETTING_URL = 'http://127.0.0.1:5500/setting.html';

const VIDEO_URL_REGEX_GLOBAL = /https?:\/\/((?![^"^']*http)[^"^']+(\.|%2e)(mp4|mkv|flv|m3u8|m4s|m3u|mov|avi|wmv|webm)(\?[^"^']+|))|((?![^"^']*http)[^"^']+\?[^"^']+(\.|%2e|video_)(mp4|mkv|flv|mov|avi|wmv|webm|m3u8|m3u)[^"^']*)/ig;

const VIDEO_URL_REGEX_EXACT = /^https?:\/\/((?![^"^']*http)[^"^']+(\.|%2e)(mp4|mkv|flv|m3u8|m4s|m3u|mov|avi|wmv|webm)(\?[^"^']+|))|((?![^"^']*http)[^"^']+\?[^"^']+(\.|%2e|video_)(mp4|mkv|flv|mov|avi|wmv|webm|m3u8|m3u)[^"^']*)$/ig;

const defaultConfig = {
    global: {
        version: '1.0.0',
        language: (navigator.language || navigator.userLanguage) === 'zh-CN' ? 'zh' : 'en',
        buttonXCoord: '0',
        buttonYCoord: '0',
        buttonScale: '1.00',
        buttonVisibilityDuration: '5000',
        networkProxy: '',
        parser: {
            ytdlp: {
                regex: [
                    "https://www.youtube.com/watch\\?.+",
                    "https://www.youtube.com/playlist\\?list=.+",
                    "https://www.lckp.top/play-with-mpv/index.html",
                ],
                preferredQuality: 'unlimited',
            },
            video: {
                regex: [
                    "https://www.libvio.fun/play/.+",
                    "https://www.tucao.my/play/.+",
                    "https://ddys.pro/.+"
                ]
            },
            url: {
                regex: [
                    "https://anime.girigirilove.com/play.+",
                ]
            },
            html: {
                regex: []
            },
            script: {
                regex: []
            },
            request: {
                regex: []
            },
            bilibili: {
                regex: [
                    "https://www.bilibili.com/bangumi/play/.+",
                    "https://www.bilibili.com/video/.+",
                    "https://www.bilibili.com/list/.+",
                    "https://www.bilibili.com/festival/.+"
                ],
                preferredQuality: '127',
                preferredSubtitle: 'off',
                preferredCodec: '12',
            },
            bilibiliLive: {
                regex: [
                    "https://live.bilibili.com/\\d+.*",
                    "https://live.bilibili.com/blanc/\\d+.*",
                    "https://live.bilibili.com/blackboard/era/.+",
                ],
                preferredQuality: '4',
                preferredLine: '0',
            }
        }
    },
    players: [{
            name: 'IINA',
            system: 'mac',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IINA_Logo.png',
            iconSize: 60,
            playEvent: "const delimiter = '&';\n\nlet args = [\n    `url=${encodeURIComponent(media.video)}`,\n    media.origin ? `mpv_http-header-fields=${encodeURIComponent('origin: ' + media.origin)}` : '',\n    media.referer ? `mpv_http-header-fields=${encodeURIComponent('referer: ' + media.referer)}` : '',\n]\nargs = args.filter(item => item !== '');\n\nconsole.log(args);\n\nwindow.open(`iina://weblink?${args.join(delimiter)}`, '_self');",
            presetEvent: {
                playAuto: false,
                pauseAuto: true,
                closeAuto: false
            },
            enable: true,
            readonly: true,
        }, {
            name: 'PotPlayer',
            system: 'windows',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/PotPlayer_logo_%282017%29.png',
            iconSize: 50,
            playEvent: "let args = [\n    `\"${media.video}\"`,\n    media.subtitle ? `/sub=\"${media.subtitle}\"` : '',\n    media.origin ? `/headers=\"origin: ${media.origin}\"` : '',\n    media.referer ? `/referer=\"${media.referer}\"` : '',\n    config.networkProxy ? `/user_agent=\"${config.networkProxy}\"` : '',\n    media.title ? `/title=\"${media.title}\"` : '',\n]\nargs = args.filter(item => item !== '');\n\nconsole.log(args);\n\nwindow.open(`ush://${player.name}?${compress(args.join(' '))}`, '_self');",
            presetEvent: {
                playAuto: false,
                pauseAuto: true,
                closeAuto: false
            },
            enable: true,
            readonly: true,
        },
        {
            name: 'MPV',
            system: 'windows',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Unofficial_Mpv_logo_%28with_gradients%29.svg',
            iconSize: 55,
            playEvent: "let args = [\n    `\"${media.video}\"`,\n    media.audio ? `--audio-file=\"${media.audio}\"` : '',\n    media.subtitle ? `--sub-file=\"${media.subtitle}\"` : '',\n    media.origin ? `--http-header-fields=\"origin: ${media.origin}\"` : '',\n    media.referer ? `--http-header-fields=\"referer: ${media.referer}\"` : '',\n    config.networkProxy ? `--http-proxy=\"${config.networkProxy}\"` : '',\n    media.ytdlp.networkProxy ? `--ytdl-raw-options=\"proxy=[${media.ytdlp.networkProxy}]\"` : '',\n    media.ytdlp.quality ? `--ytdl-format=\"bestvideo[height<=?${media.ytdlp.quality}]%2Bbestaudio/best\"` : '',\n    media.bilibili.cid ? `--script-opts-append=\"cid=${media.bilibili.cid}\"` : '',\n    media.title ? `--force-media-title=\"${media.title}\"` : '',\n]\nargs = args.filter(item => item !== '');\n\nconsole.log(args);\n\nwindow.open(`ush://${player.name}?${compress(args.join(' '))}`, '_self');",
            presetEvent: {
                playAuto: false,
                pauseAuto: true,
                closeAuto: false
            },
            enable: true,
            readonly: true,
        }
    ]
}

const translations = {
    en: {
        loadSuccessfully: 'Load successfully',
        loadTimeout: 'Load timeout ......',
        saveSuccessfully: 'Save successfully',
        loadFail: 'Load fail',
        requireLoginOrVip: 'Require login or vip',
        noMatchingParserFound: 'No matching parser found',
        onlyNewTabsCanCloseAutomatically: 'Only new tabs can close automatically'
    },
    zh: {
        loadSuccessfully: '加载成功',
        loadTimeout: '加载超时 ......',
        saveSuccessfully: '保存成功',
        loadFail: '加载失败',
        requireLoginOrVip: '需要登录或会员',
        noMatchingParserFound: '没有匹配的解析器',
        onlyNewTabsCanCloseAutomatically: '只有新标签页才能自动关闭'
    }
};

const REFRESH_INTERVAL = 500;
const MAX_TRY_COUNT = 5;

var currentTryCount;
var currentConfig;
var currentUrl;
var currentParser;
var currentMedia;
var currentPlayer;
var translation;

class BaseParser {
    constructor() {
        currentMedia = {
            video: undefined,
            audio: undefined,
            subtitle: undefined,
            title: undefined,
            origin: undefined,
            referer: undefined,
            bilibili: {
                cid: undefined
            },
            ytdlp: {
                quality: undefined,
                networkProxy: undefined
            }
        }
    }
    async execute() {}
    async parseVideo() {
        currentMedia.video = location.href;
    }
    async parseAudio() {}
    async parseSubtitle() {}
    async parseTitle() {
        currentMedia.title = document.title;
    }
    async parseOrigin() {
        currentMedia.origin = location.origin || location.href;
    }
    async parseReferer() {
        let index = currentUrl.indexOf('?');
        currentMedia.referer = index > 0 ? currentUrl.substring(0, index) : currentUrl;
    }
    async check(video) {
        if (!video) {
            video = currentMedia.video;
        }
        if (!video || !video.startsWith('http') || video.startsWith('https://www.mp4')) {
            return false;
        }

        if (video.indexOf('.m3u8') > -1 || video.indexOf('.m3u') > -1) {
            try {
                const response = await (await fetch(video, {
                    method: 'GET',
                    credentials: 'include'
                })).body();
                return response && response.indexOf('png') === -1;
            } catch (error) {}
        }
        return new RegExp(VIDEO_URL_REGEX_EXACT).test(video);
    }
    async pause() {
        for (let index = 0; index < MAX_TRY_COUNT; index++) {
            try {
                for (const video of document.getElementsByTagName('video')) {
                    video.pause();
                }

                for (const iframe of document.getElementsByTagName('iframe')) {
                    if (iframe.contentDocument) {
                        for (const video of iframe.contentDocument.getElementsByTagName('video')) {
                            video.pause();
                        }
                    }
                }
            } catch (error) {
                console.error('暂停失败', error);
            } finally {
                await sleep(REFRESH_INTERVAL * 3);
            }
        }
    }
    async close() {
        try {
            await sleep(REFRESH_INTERVAL * 2);
            if (window.top.history.length === 1) {
                window.top.location.href = "about:blank";
                window.top.close();
            } else {
                showToast(translation.onlyNewTabsCanCloseAutomatically);
            }
        } catch (error) {
            console.error('关闭失败', error);
        }
    }
    async play(player) {
        try {
            showLoading(6000);
            currentPlayer = player;
            let media = currentMedia;
            let parser = currentParser;
            let config = currentConfig.global;

            currentTryCount = 0;
            let latestError = undefined;
            do {
                currentTryCount++;
                try {
                    await parser.execute();
                    if (await parser.check()) {
                        latestError = undefined;
                        break;
                    }
                    await sleep(REFRESH_INTERVAL * 2);
                } catch (error) {
                    latestError = error;
                    console.error(`第${currentTryCount}次尝试解析失败：`, error);
                }
            }
            while (currentTryCount < MAX_TRY_COUNT);
            if (latestError) {
                showToast(translation.loadFail + ': ' + latestError.message);
                return;
            }
            if (!await parser.check()) {
                showToast(translation.loadFail);
                return;
            }

            if (player.playEvent) {
                eval(policy.createScript(player.playEvent));
            }

            if (player.presetEvent.closeAuto) {
                parser.close();
            }
            if (player.presetEvent.pauseAuto) {
                parser.pause();
            }
        } catch (error) {
            showToast(translation.loadFail + ': ' + error.message);
        } finally {
            hideLoading();
        }
    }
}

const PARSER = {
    YTDLP: class Parser extends BaseParser {
        async execute() {
            currentMedia.ytdlp.quality = currentConfig.global.parser.ytdlp.preferredQuality === 'unlimited' ?
                undefined :
                currentConfig.global.parser.ytdlp.preferredQuality;
            currentMedia.ytdlp.networkProxy = currentConfig.global.networkProxy ?
                currentConfig.global.networkProxy :
                undefined;
            await this.parseVideo();
        }
        async check() {
            return currentMedia.video ? true : false;
        }
    },
    VIDEO: class Parser extends BaseParser {
        async execute() {
            await this.parseVideo();
            await this.parseTitle();
            await this.parseReferer();
        }
        async parseVideo() {
            for (const video of document.getElementsByTagName('video')) {
                if (await this.check(video.src)) {
                    currentMedia.video = video.src;
                    return;
                }
            }

            for (const iframe of document.getElementsByTagName('iframe')) {
                if (iframe.contentDocument) {
                    for (const video of iframe.contentDocument.getElementsByTagName('video')) {
                        if (await this.check(video.src)) {
                            currentMedia.video = video.src;
                            return;
                        }
                    }
                }
            }
        }
    },
    URL: class Parser extends BaseParser {
        async execute() {
            await this.parseVideo();
            await this.parseTitle();
            await this.parseReferer();
        }
        async parseVideo() {
            let urls = currentUrl.match(VIDEO_URL_REGEX_GLOBAL) || [];
            for (const url of urls) {
                if (await this.check(url)) {
                    currentMedia.video = url;
                    return;
                }
            }

            for (const iframe of document.getElementsByTagName('iframe')) {
                let urls = iframe.src.match(VIDEO_URL_REGEX_GLOBAL) || [];
                for (const url of urls) {
                    if (await this.check(url)) {
                        currentMedia.video = url;
                        return;
                    }
                }
            }
        }
    },
    HTML: class Parser extends BaseParser {
        async execute() {
            await this.parseVideo();
            await this.parseTitle();
            await this.parseReferer();
        }
        async parseVideo() {
            let urls = document.body.innerHTML.match(VIDEO_URL_REGEX_GLOBAL) || [];
            for (const url of urls) {
                if (await this.check(url)) {
                    currentMedia.video = url;
                    return;
                }
            }

            for (const iframe of document.getElementsByTagName('iframe')) {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (!doc) {
                    continue;
                }
                urls = doc.body.innerHTML.match(VIDEO_URL_REGEX_GLOBAL) || [];
                for (const url of urls) {
                    if (await this.check(url)) {
                        currentMedia.video = url;
                        return;
                    }
                }
            }
        }
    },
    SCRIPT: class Parser extends BaseParser {
        async execute() {
            await this.parseVideo();
            await this.parseTitle();
            await this.parseReferer();
        }
        async parseVideo() {
            for (const script of document.scripts) {
                let urls = script.innerHTML.match(VIDEO_URL_REGEX_GLOBAL) || [];
                for (const url of urls) {
                    if (await this.check(url)) {
                        currentMedia.video = url;
                        return;
                    }
                }
            }

            for (const iframe of document.getElementsByTagName('iframe')) {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (!doc) {
                    continue;
                }
                for (const script of doc.scripts) {
                    let urls = script.innerHTML.match(VIDEO_URL_REGEX_GLOBAL) || [];
                    for (const url of urls) {
                        if (await this.check(url)) {
                            currentMedia.video = url;
                            return;
                        }
                    }
                }
            }
        }
    },
    REQUEST: class Parser extends BaseParser {
        constructor() {
            super();
            this.video = undefined;
            let that = this;
            const open = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
                if (!that.video) {
                    let urls = url.match(VIDEO_URL_REGEX_GLOBAL) || [];
                    for (const vurl of urls) {
                        that.check(vurl).check().then(
                            result => {
                                if (result === true) {
                                    that.video = vurl;
                                }
                            }
                        )
                    }

                }
                return open.apply(this, arguments);
            };

            const originalFetch = fetch;

            window.fetch = function (url, options) {
                return originalFetch(url, options).then(response => {
                    alert(url);
                    if (!that.video) {
                        let urls = url.match(VIDEO_URL_REGEX_GLOBAL) || [];
                        for (const vurl of urls) {
                            that.check(vurl).check().then(
                                result => {
                                    if (result === true) {
                                        that.video = vurl;
                                    }
                                }
                            )
                        }

                    }

                    return response;
                });
            };
        }
        async execute() {
            await this.parseVideo();
        }
        async parseVideo() {
            currentMedia.video = this.video;
        }
    },
    BILIBILI: class Parser extends BaseParser {
        async execute() {
            await this.parseTitle();
            await this.parseVideo();
            await this.parseReferer();
        }
        async parseVideo() {
            let videoInfo = undefined; //await this.getVideoInfo();

            if (!videoInfo || !videoInfo.aid || !videoInfo.cid) {
                if (currentUrl.startsWith('https://www.bilibili.com/bangumi/')) {
                    videoInfo = await this.getVideoInfoByEpid();
                } else {
                    videoInfo = await this.getVideoInfoByBvid();
                }
            }

            if (!videoInfo || !videoInfo.aid || !videoInfo.cid) {
                throw new Error('can not find aid and cid');
            }

            const aid = videoInfo.aid;
            const cid = videoInfo.cid;
            const title = videoInfo.title;
            const codecid = currentConfig.global.parser.bilibili.preferredCodec;
            const quality = currentConfig.global.parser.bilibili.preferredQuality;

            currentMedia.bilibili.cid = cid;
            currentMedia.title = title ? title : currentMedia.title;
            if (currentConfig.global.parser.bilibili.preferredSubtitle &&
                currentConfig.global.parser.bilibili.preferredSubtitle !== 'off') {
                currentMedia.subtitle = await this.getSubtitle(aid, cid);
            }
            // 支持传入音频优先获取 dash 格式视频，以支持更高分辨率
            if (currentPlayer.playEvent && currentPlayer.playEvent.indexOf('audio') > -1) {
                const dash = await this.getDash(aid, cid, codecid, quality);
                if (dash) {
                    currentMedia.audio = dash.audio;
                    currentMedia.video = dash.video;
                    return;
                }
            }
            currentMedia.video = await this.getFlvOrMP4(aid, cid);
        }
        async getVideoInfo() {
            try {
                const initialState = __INITIAL_STATE__;
                if (!initialState) {
                    return;
                }
                const videoInfo = initialState.epInfo || initialState.videoData || initialState.videoInfo;
                const aid = videoInfo.aid;
                const page = initialState.p;
                let cid = videoInfo.cid;
                let title = videoInfo.title;
                if (page && page > 1) {
                    cid = initialState.cidMap[aid].cids[page];
                }

                return {
                    aid: aid,
                    cid: cid,
                    title: title
                };
            } catch (error) {
                console.error(error.message);
            }
        }
        async getVideoInfoByBvid() {
            let param = undefined;
            const bvids = currentUrl.match(/BV([0-9a-zA-Z]+)/);
            if (bvids && bvids[1]) {
                param = `bvid=${bvids[1]}`;
            } else {
                const avids = page.url.match(/av([0-9]+)/);
                param = `aid=${avids[1]}`;
            }

            if (!param) {
                throw new Error('can not find bvid or avid');
            }

            const response = await (await fetch(`https://api.bilibili.com/x/web-interface/view?${param}`, {
                method: 'GET',
                credentials: 'include'
            })).json();

            let aid = response.data.aid;
            let cid = response.data.cid;
            let title = response.data.title;

            // 分 p 视频
            let index = currentUrl.indexOf("?p=");
            if (index > -1 && response.data.pages.length > 1) {
                let p = currentUrl.substring(index + 3);
                let endIndex = p.indexOf("&");
                if (endIndex > -1) {
                    p = p.substring(0, endIndex);
                }
                const currentPage = res.data.pages[p - 1];
                cid = currentPage.cid;
                title = currentPage.part;
            }

            return {
                aid: aid,
                cid: cid,
                title: title
            };
        }
        async getVideoInfoByEpid() {
            let epid = undefined;
            let epids = currentUrl.match(/ep(\d+)/);
            if (epids && epids[1]) {
                epid = epids[1];
            } else {
                let epidElement = undefined;
                let epidElementClassNames = [
                    "ep-item cursor visited",
                    "ep-item cursor",
                    "numberListItem_select__WgCVr",
                    "imageListItem_wrap__o28QW",
                ];
                for (const className of epidElementClassNames) {
                    epidElement = document.getElementsByClassName(className)[0];
                    if (epidElement) {
                        epid = epidElement.getElementsByTagName("a")[0].href.match(/ep(\d+)/)[1];
                        break;
                    }
                }

                if (!epid) {
                    epidElement = document.getElementsByClassName("squirtle-pagelist-select-item active squirtle-blink")[0];
                    if (epidElement) {
                        epid = epidElement.dataset.value;
                    }
                }
            }

            if (!epid) {
                throw new Error('can not find epid');
            }

            const response = await (await fetch(`https://api.bilibili.com/pgc/view/web/season?ep_id=${epid}`, {
                method: 'GET',
                credentials: 'include'
            })).json();
            let section = response.result.section;
            if (!section) {
                section = new Array();
            }
            section.push({
                episodes: response.result.episodes
            });
            let currentEpisode;
            for (let i = section.length - 1; i >= 0; i--) {
                let episodes = section[i].episodes;
                for (const episode of episodes) {
                    if (episode.id == epid) {
                        currentEpisode = episode;
                        break;
                    }
                }
                if (currentEpisode) {
                    return {
                        aid: currentEpisode.aid,
                        cid: currentEpisode.cid,
                        title: currentEpisode.share_copy
                    }
                }
            }
        }
        async getDash(aid, cid, codecid, quality) {
            const url = `https://api.bilibili.com/x/player/playurl?qn=120&otype=json&fourk=1&fnver=0&fnval=4048&avid=${aid}&cid=${cid}`;
            const response = await (await fetch(url, {
                method: 'GET',
                credentials: 'include'
            })).json();
            if (!response.data) {
                currentTryCount = MAX_TRY_COUNT;
                throw new Error(translation.requireLoginOrVip);
            }
            let video = undefined;
            let audio = undefined;
            let dash = response.data.dash;
            if (!dash) {
                return undefined;
            }
            let hiRes = dash.flac;
            let dolby = dash.dolby;
            if (hiRes && hiRes.audio) {
                audio = hiRes.audio.baseUrl;
            } else if (dolby && dolby.audio) {
                audio = dolby.audio[0].base_url;
            } else if (dash.audio) {
                audio = dash.audio[0].baseUrl;
            }
            let i = 0;
            while (i < dash.video.length &&
                dash.video[i].id > quality) {
                i++;
            }
            video = dash.video[i].baseUrl;
            let id = dash.video[i].id;
            while (i < dash.video.length) {
                if (dash.video[i].id != id) {
                    break;
                }
                if (dash.video[i].codecid == codecid) {
                    video = dash.video[i].baseUrl;
                    break;
                }
                i++;
            }
            return {
                video: video,
                audio: audio
            };
        }
        async getFlvOrMP4(aid, cid) {
            const url = `https://api.bilibili.com/x/player/playurl?qn=120&otype=json&fourk=1&fnver=0&fnval=128&avid=${aid}&cid=${cid}`;
            const response = await (await fetch(url, {
                method: 'GET',
                credentials: 'include'
            })).json();
            if (!response.data) {
                currentTryCount = MAX_TRY_COUNT;
                throw new Error(translation.requireLoginOrVip);
            }
            return response.data.durl[0].url;
        }
        async getSubtitle(avid, cid) {
            const url = `https://api.bilibili.com/x/player/wbi/v2?aid=${avid}&cid=${cid}`;
            const response = await (await fetch(url, {
                method: 'GET',
                credentials: 'include'
            })).json();

            if (response.code === 0 && response.data.subtitle && response.data.subtitle.subtitles.length > 0) {
                let subtitles = response.data.subtitle.subtitles;
                let url = subtitles[0].subtitle_url;
                let lan = subtitles[0].lan;
                for (const subtitle of subtitles) {
                    if (currentConfig.global.parser.bilibili.preferredSubtitle.startsWith("zh") &&
                        subtitle.lan.startsWith("zh")) {
                        url = subtitle.subtitle_url;
                        lan = subtitle.lan;
                    }
                    if (subtitle.lan == currentConfig.subtitlePrefer) {
                        url = subtitle.subtitle_url;
                        lan = subtitle.lan;
                        break;
                    }
                }
                if (url) {
                    return `https://www.lckp.top/common/bilibili/jsonToSrt/?url=https:${url}&lan=${lan}`;
                }
            }
        }
    },
    BILIBILI_LIVE: class Parser extends BaseParser {
        async execute() {
            await this.parseVideo();
            await this.parseTitle();
            await this.parseReferer();
        }
        async parseVideo() {
            let iframes = document.getElementsByTagName("iframe");
            let roomid = undefined;
            for (let iframe of iframes) {
                let roomids = iframe.src.match(
                    /^https:\/\/live\.bilibili\.com.*(roomid=\d+|blanc\/\d+).*/
                );
                if (roomids && roomids[1]) {
                    roomid = roomids[1].match(/\d+/)[0];
                    break;
                }
            }

            if (!roomid) {
                throw new Error('can not find roomid');
            }

            const quality = currentConfig.global.parser.bilibiliLive.preferredQuality;
            const url = `https://api.live.bilibili.com/room/v1/Room/playUrl?quality=${quality}&cid=${roomid}`;
            const response = await (await fetch(url, {
                method: 'GET',
                credentials: 'include'
            })).json();

            const durls = response.data.durl;
            const line = currentConfig.global.parser.bilibiliLive.preferredLine;
            let durl = durls[durls.length - 1];
            for (let index = 0; index < durls.length; index++) {
                if (line == index) {
                    durl = durls[index];
                    break;
                }
            }
            currentMedia.video = durl.url;
        }
    }
};

function compress(str) {
    return btoa(String.fromCharCode(...pako.gzip(str)));
};

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadConfig() {
    let config = GM_getValue('config');
    if (config) {
        if (config.global.version === defaultConfig.global.version) {
            return config;
        }
        console.log('更新配置 ......');
        config = updateConfig(defaultConfig, config);
        config.global.version = defaultConfig.global.version;
    } else {
        console.log('初始化配置 ......');
        config = JSON.parse(JSON.stringify(defaultConfig));
        for (const key in config.global.parser) {
            config.global.parser[key].regex = [];
        }
    }
    GM_setValue('config', config);
    return config;
}

function updateConfig(defaultConfig, config) {
    function mergeDefaults(defaultObj, currentObj) {
        if (typeof defaultObj !== 'object' || defaultObj === null) {
            return currentObj !== undefined ? currentObj : defaultObj;
        }

        if (Array.isArray(defaultObj)) {
            return Array.isArray(currentObj) ? currentObj : defaultObj;
        }

        const merged = {};
        for (const key in defaultObj) {
            if (key === 'regex') {
                merged[key] = currentObj?. [key] || [];
                continue;
            }
            merged[key] = mergeDefaults(defaultObj[key], currentObj?. [key]);
        }
        return merged;
    }

    const newConfig = mergeDefaults(defaultConfig, config);
    for (let index = 0; index < defaultConfig.players.length; index++) {
        const dp = defaultConfig.players[index];
        const np = newConfig.players[index];
        if (dp.name === np.name) {
            np.readonly = dp.readonly;
            np.playEvent = dp.playEvent;
        } else {
            newConfig.players.unshift(dp);
        }
    }

    return newConfig;
}

function matchParser(parser, url) {
    for (const key in parser) {
        for (const regex of parser[key].regex) {
            if (!regex || regex.startsWith('#') || regex.startsWith('//')) {
                continue;
            }
            if (new RegExp(regex).test(url)) {
                console.log(`match parser regex: ${new RegExp(regex)}`);
                return new PARSER[key.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()]();
            }
        }
    }
}

// =================================== 按钮区域和设置页面 ===================================

const policy = window.trustedTypes.createPolicy('externalPlayer', {
    createHTML: (string, sink) => string,
    createScript: (input) => input
})

const ID_PREFIX = 'LCKP-EP-2024';
const FIRST_Z_INDEX = 999999999;
const SECOND_Z_INDEX = FIRST_Z_INDEX - 1;
const THIRD_Z_INDEX = SECOND_Z_INDEX - 1;

const COLORS = [{
    // 配色方案1
    PRIMARY: 'rgba(245, 166, 35, 1)',
    TEXT: 'rgba(90, 90, 90, 1)',
    TEXT_ACTIVE: 'rgba(255, 255, 255, 1)',
    WARNING: 'rgba(233, 78, 119, 1)',
    BORDER: 'rgba(243, 229, 213, 1)',
}, {
    // 配色方案2
    PRIMARY: 'rgba(60, 179, 113, 1)',
    TEXT: 'rgba(47, 79, 79, 1)',
    TEXT_ACTIVE: 'rgba(255, 255, 255, 1)',
    WARNING: 'rgba(255, 111, 97, 1)',
    BORDER: 'rgba(204, 231, 208, 1)',
}, {
    // 配色方案3
    PRIMARY: 'rgba(74, 144, 226, 1)',
    TEXT: 'rgba(51, 51, 51, 1)',
    TEXT_ACTIVE: 'rgba(255, 255, 255, 1)',
    WARNING: 'rgba(242, 95, 92, 1)',
    BORDER: 'rgba(217, 227, 240, 1)',
}]
const COLOR = COLORS[2];

var style;
var buttonDiv;
var toastDiv;
var loadingDiv;
var settingButton;
var settingIframe;
var loadingId;
var isReloading = false;

function appendCss() {
    if (style) {
        return;
    }
    style = document.createElement('style');
    style.innerHTML = policy.createHTML(`
        #${ID_PREFIX}-toast-div {
            z-index: ${FIRST_Z_INDEX};
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translate(-50%, 0);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            font-size: 14px;
            padding: 10px 20px;
            border-radius: 5px;
            opacity: 0;
            transition: opacity 0.5s ease;
            display: none;
            letter-spacing: 1px;
        }
        #${ID_PREFIX}-loading-div {
            z-index: ${FIRST_Z_INDEX};
            display: none;
            position: fixed;
            bottom: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0);
        }
        #${ID_PREFIX}-loading-div div {
            width: 50px;
            height: 50px;
            background-color: ${COLOR.PRIMARY};
            border-radius: 0;
            -webkit-animation: sk-rotateplane 1.2s infinite ease-in-out;
            animation: sk-rotateplane 1.2s infinite ease-in-out;
        }
        @-webkit-keyframes sk-rotateplane {
            0% {
                -webkit-transform: perspective(120px)
            }
            50% {
                -webkit-transform: perspective(120px) rotateY(180deg)
            }
            100% {
                -webkit-transform: perspective(120px) rotateY(180deg) rotateX(180deg)
            }
        }
        @keyframes sk-rotateplane {
            0% {
                transform: perspective(120px) rotateX(0deg) rotateY(0deg);
                -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg)
            }
            50% {
                transform: perspective(120px) rotateX(-180deg) rotateY(0deg);
                -webkit-transform: perspective(120px) rotateX(-180deg) rotateY(0deg)
            }
            100% {
                transform: perspective(120px) rotateX(-180deg) rotateY(-180deg);
                -webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-180deg);
            }
        }
        #${ID_PREFIX}-button-div {
            z-index: ${THIRD_Z_INDEX};
            position: fixed;
            display: none;
            align-items: center;
            width: auto;
            height: auto;
            left: ${currentConfig.global.buttonXCoord}px;
            bottom: ${currentConfig.global.buttonYCoord}px;
            padding: 5px;
            border: 3px solid rgba(0, 0, 0, 0);
            border-radius: 5px;
            cursor: move;
            gap: 10px;
            background-color: rgba(0, 0, 0, 0);
            min-width: ${50 * currentConfig.global.buttonScale}px;
            min-height: ${50 * currentConfig.global.buttonScale}px;
        }
        #${ID_PREFIX}-button-div button {
            color: white;
            font-size: 20px;
            font-weight: bold;
            width: 50px;
            height: 50px;
            outline: none;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            background-size: cover;
            background-color: rgba(0, 0, 0, 0);
            transition: opacity 0.5s ease, visibility 0s linear 0.5s;
        }
        #${ID_PREFIX}-button-div:hover {
            background-color: rgb(255, 255, 255, 0.3) !important;
        }
        #${ID_PREFIX}-button-div:hover button {
            visibility: visible !important;
            transition: opacity 0.5s ease, visibility 0s;
        }
        #${ID_PREFIX}-button-div button:hover {
            transform: scale(1.06);
            box-shadow: 0px 0px 16px #e6e6e6;
        }
        #${ID_PREFIX}-setting-button {
            visibility: hidden;
            position: absolute;
            right: ${-12 * currentConfig.global.buttonScale}px !important;
            top: ${-12 * currentConfig.global.buttonScale}px !important;
            width: ${25 * currentConfig.global.buttonScale}px !important;
            height: ${25 * currentConfig.global.buttonScale}px !important;            
            background-image: url('data:image/svg+xml,<svg t="1731846507027" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4281" width="16" height="16"><path d="M616.533333 512.128c0-25.6-9.941333-49.536-28.16-67.669333a95.744 95.744 0 0 0-67.84-28.074667c-25.685333 0-49.706667 9.984-67.925333 28.074667a95.146667 95.146667 0 0 0-28.16 67.669333c0 25.6 10.069333 49.578667 28.16 67.712 18.218667 18.048 42.24 28.074667 67.925333 28.074667 25.642667 0 49.664-10.026667 67.84-28.074667 18.218667-18.133333 28.16-42.112 28.16-67.712z m-202.112 352.896l48-55.978667a309.290667 309.290667 0 0 0 99.029334 0l48 55.978667a27.52 27.52 0 0 0 30.208 7.978667l2.218666-0.768a380.074667 380.074667 0 0 0 118.186667-68.138667l1.834667-1.536a27.434667 27.434667 0 0 0 8.106666-30.037333l-24.746666-69.546667a298.666667 298.666667 0 0 0 49.322666-85.205333l72.874667-13.44a27.477333 27.477333 0 0 0 22.058667-22.101334l0.426666-2.304a384.64 384.64 0 0 0 0-135.936l-0.426666-2.304a27.477333 27.477333 0 0 0-22.058667-22.058666l-73.216-13.525334a302.293333 302.293333 0 0 0-49.194667-84.650666l25.002667-70.016a27.306667 27.306667 0 0 0-8.149333-30.037334l-1.834667-1.536a383.018667 383.018667 0 0 0-118.186667-68.138666l-2.218666-0.768a27.605333 27.605333 0 0 0-30.208 7.936l-48.512 56.661333a302.592 302.592 0 0 0-97.834667 0L414.592 159.146667a27.52 27.52 0 0 0-30.208-7.978667l-2.218667 0.768a381.056 381.056 0 0 0-118.186666 68.138667l-1.834667 1.536a27.434667 27.434667 0 0 0-8.106667 30.037333l24.96 69.973333a296.192 296.192 0 0 0-49.194666 84.693334l-73.216 13.525333a27.477333 27.477333 0 0 0-22.058667 22.058667l-0.426667 2.304a382.592 382.592 0 0 0 0 135.936l0.426667 2.304c2.048 11.221333 10.794667 20.053333 22.058667 22.101333l72.874666 13.44a300.672 300.672 0 0 0 49.365334 85.248l-24.832 69.504a27.306667 27.306667 0 0 0 8.149333 30.037333l1.834667 1.536a383.018667 383.018667 0 0 0 118.186666 68.138667l2.218667 0.768a27.733333 27.733333 0 0 0 30.037333-8.149333z m-44.8-352.853333A150.656 150.656 0 0 1 520.533333 361.642667a150.656 150.656 0 0 1 150.869334 150.442666A150.656 150.656 0 0 1 520.533333 662.613333a150.656 150.656 0 0 1-150.912-150.485333z" fill="${COLOR.PRIMARY}" p-id="4282"></path></svg>');
        }
        #${ID_PREFIX}-setting-iframe {
            z-index: ${SECOND_Z_INDEX};
            position: fixed;
            width: 1000px;
            height: 500px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: none;
            border-radius: 5px;
            box-shadow: 0 0 16px rgba(0, 0, 0, 0.6);
            background-color: #fff;
            display: none;
        }
    `);
    document.head.appendChild(style);
}

function appendToastDiv() {
    const TOAST_DIV_ID = `${ID_PREFIX}-toast-div`;
    if (document.getElementById(TOAST_DIV_ID)) {
        return;
    }
    toastDiv = document.createElement('div');
    toastDiv.id = TOAST_DIV_ID;
    document.body.appendChild(toastDiv);
}

function showToast(message) {
    toastDiv.textContent = message;
    toastDiv.style.opacity = '0.9';
    toastDiv.style.display = 'block';
    setTimeout(() => {
        toastDiv.style.opacity = '0';
        toastDiv.style.display = 'none';
    }, 5000);
}

function appendLoadingDiv() {
    const LOADING_DIV_ID = `${ID_PREFIX}-loading-div`;
    if (document.getElementById(LOADING_DIV_ID)) {
        return;
    }
    loadingDiv = document.createElement('div');
    loadingDiv.id = LOADING_DIV_ID;
    loadingDiv.appendChild(document.createElement('div'));
    document.body.appendChild(loadingDiv);
}

function showLoading(timeout) {
    if (loadingId) {
        clearTimeout(loadingId);
        loadingId = undefined;
    }
    if (!timeout) {
        timeout = 10000;
    }
    loadingDiv.style.display = 'block';
    loadingId = setTimeout(() => {
        if (loadingDiv.style.display === 'block') {
            hideLoading();
            showToast(translation.loadTimeout);
        }
    }, timeout);
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

function appendButtonDiv() {
    const BUTTON_DIV_ID = `${ID_PREFIX}-button-div`;
    if (document.getElementById(BUTTON_DIV_ID)) {
        return;
    }
    buttonDiv = document.createElement('div');
    buttonDiv.id = BUTTON_DIV_ID;
    buttonDiv.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        let offsetX = e.clientX - buttonDiv.getBoundingClientRect().left;
        let offsetY = e.clientY - buttonDiv.getBoundingClientRect().top;

        document.addEventListener('mouseup', mouseUpHandler);
        document.addEventListener('mousemove', mouseMoveHandler);

        function mouseUpHandler() {
            buttonDiv.style.border = '3px solid rgba(0, 0, 0, 0)';
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        }

        function mouseMoveHandler(e) {
            buttonDiv.style.border = `3px solid ${COLOR.PRIMARY}`;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const divWidth = buttonDiv.offsetWidth;
            const divHeight = buttonDiv.offsetHeight;

            if (newX < 0) newX = 0;
            if (newX + divWidth > windowWidth) newX = windowWidth - divWidth;
            if (newY < 0) newY = 0;
            if (newY + divHeight > windowHeight) newY = windowHeight - divHeight;

            newY = windowHeight - newY - divHeight;
            buttonDiv.style.left = `${newX}px`;
            buttonDiv.style.bottom = `${newY}px`;
            currentConfig.global.buttonXCoord = newX;
            currentConfig.global.buttonYCoord = newY;
            GM_setValue('config', currentConfig);
        }
    });
    document.body.appendChild(buttonDiv);

    appendPlayButton();
    appendSettingButton();

    // 全屏隐藏
    document.addEventListener("fullscreenchange", () => {
        if (document.fullscreenElement) {
            buttonDiv.style.display = "none";
        } else {
            if (currentParser) {
                buttonDiv.style.display = "flex";
            }
        }
    });
}

function appendPlayButton() {
    if (!currentConfig.players) {
        return;
    }
    var playButtonNeedAutoClick;
    currentConfig.players.forEach(player => {
        if (player.enable !== true) {
            return;
        }
        const playButton = document.createElement('button');
        if (player.icon) {
            const image = new Image();
            image.src = player.icon;
            image.onload = () => playButton.style.backgroundImage = `url(${image.src})`;
            image.onerror = () => {
                playButton.style.backgroundColor = COLOR.PRIMARY;
                playButton.textContent = player.name ? player.name.substring(0, 1) : 'P';
            };
        } else {
            playButton.style.backgroundColor = COLOR.PRIMARY;
            playButton.textContent = player.name ? player.name.substring(0, 1) : 'P';
        }
        playButton.style.width = `${player.iconSize * currentConfig.global.buttonScale}px`;
        playButton.style.height = `${player.iconSize * currentConfig.global.buttonScale}px`;

        // 自动隐藏
        if (currentConfig.global.buttonVisibilityDuration == 0) {
            playButton.style.visibility = 'hidden';
        } else if (currentConfig.global.buttonVisibilityDuration > 0) {
            setTimeout(() => {
                playButton.style.visibility = 'hidden';
            }, currentConfig.global.buttonVisibilityDuration);
        }

        playButton.addEventListener('click', async function () {
            if (currentParser) {
                currentParser.play(player);
            } else {
                showToast(translation.noMatchingParserFound);
            }
        });

        buttonDiv.appendChild(playButton);
    });
}

function appendSettingButton() {
    settingButton = document.createElement('button');
    settingButton.id = `${ID_PREFIX}-setting-button`;
    settingButton.title = 'Ctrl + Alt + E';

    settingButton.addEventListener('click', async () => {
        await appendSettingIframe();
        if (settingIframe.style.display === "block") {
            settingIframe.style.display = "none";
        } else {
            settingIframe.contentWindow.postMessage({
                defaultConfig: defaultConfig,
                config: currentConfig
            }, '*');
            settingIframe.style.display = "block";
        }
    });
    buttonDiv.appendChild(settingButton);

    // 失去焦点隐藏设置页面
    document.addEventListener('click', (event) => {
        if (settingIframe && settingIframe.style.display === 'block' &&
            !settingButton.contains(event.target) &&
            !settingIframe.contains(event.target)) {
            settingIframe.style.display = 'none';
        }
    });
}

async function appendSettingIframe() {
    const SETTING_IFRAME_ID = `${ID_PREFIX}-setting-iframe`;
    if (document.getElementById(SETTING_IFRAME_ID)) {
        return;
    }
    settingIframe = document.createElement('iframe');
    settingIframe.id = SETTING_IFRAME_ID;
    let settingIframeHtml = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>External Player</title>
        <style>
            :root {
                --primary-color: ${COLOR.PRIMARY};
                --text-color: ${COLOR.TEXT};
                --text-active-color: ${COLOR.TEXT_ACTIVE};
                --warning-color: ${COLOR.WARNING};
                --border-color: ${COLOR.BORDER};
            }

            body {
                display: flex;
                flex-direction: row;
                height: 100vh;
                margin: 0;
            }

            body,
            button,
            input,
            textarea,
            select {
                font-family: auto;
                color: var(--text-color);
            }

            ::placeholder {
                font-family: auto;
                color: var(--text-color);
                opacity: 0.2;
            }

            #sidebar-container {
                display: none;
                flex: 0 0 200px;
                flex-direction: column;
                background-color: #f4f4f4;
                box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
                padding: 25px 20px 35px 20px;
            }

            #sidebar {
                flex: 1;
                overflow-y: auto;
                position: relative;
                border: none;
                border-radius: 5px;
                margin-bottom: 10px;
            }

            #sidebar::-webkit-scrollbar {
                display: none !important;
            }

            .reset-button,
            #add-tab-button,
            #save-button,
            #sidebar button {
                width: 200px;
                padding: 10px;
                margin: 0 0 10px 0;
                border: none;
                border-radius: 5px;
                background-color: #e0e0e0;
                cursor: pointer;
                font-size: 15px;
                white-space: nowrap;
                display: inline-flex;
                position: relative;
                align-items: center;
                justify-content: center;
            }

            #add-tab-button,
            #save-button {
                background-color: var(--primary-color);
                color: var(--text-active-color);
                margin: 0;
            }

            #add-tab-button {
                font-size: 25px;
                line-height: 21.45px;
            }

            #add-tab-button:hover,
            #save-button:hover {
                opacity: 0.9;
            }

            #reset-button-coord-button {
                padding: 7px 10px;
            }

            .reset-button {
                margin: 0;
                width: 80px;
                background-color: var(--warning-color);
                color: var(--text-active-color);
                opacity: 0.6;
            }

            .reset-button:hover {
                opacity: 0.8;
            }

            #sidebar button svg {
                width: 20px !important;
                height: 20px !important;
                position: absolute;
                left: 10px;
                fill: var(--text-color);
            }

            #content .radio-button svg {
                width: 20px !important;
                height: 20px !important;
                fill: var(--text-color);
            }

            #sidebar button.active svg,
            #sidebar button:hover svg,
            #content .radio-button.active svg,
            #content .radio-button:hover svg {
                fill: var(--text-active-color)
            }

            #sidebar button.active {
                background-color: var(--primary-color);
                color: var(--text-active-color);
            }

            #sidebar button:hover {
                background-color: var(--primary-color);
                color: var(--text-active-color);
            }

            #content-container {
                display: none;
                flex-direction: column;
                flex: 1;
                padding: 25px 20px 0 20px;
            }

            #content {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                position: relative;
                border: 1px solid var(--border-color);
                border-radius: 5px;
                margin-bottom: 15px;
            }

            .tab {
                display: none;
                position: relative;
            }

            .tab.active {
                display: block;
            }

            .input-group {
                margin-bottom: 15px;
            }

            label {
                display: flex;
                margin-bottom: 5px;
                font-weight: bold;
                align-items: center;
            }

            input[type="number"] {
                width: calc(100% - 16px);
                font-size: 14px;
                border-radius: 5px;
                border: 1px solid var(--border-color);
                margin-right: 15px;
                padding: 8px;
            }

            input[type="text"],
            input[type="search"],
            textarea {
                width: 100%;
                min-width: 400px;
                padding: 8px;
                border: 1px solid var(--border-color);
                border-radius: 5px;
                font-size: 14px;
                box-sizing: border-box;
            }

            textarea {
                resize: vertical;
                height: 160px;
            }

            .switch {
                position: relative;
                display: inline-block;
                width: 54px;
                height: 24px;
            }

            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .switch-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: 0.4s;
                border-radius: 34px;
            }

            .switch-slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                border-radius: 50%;
                left: 4px;
                bottom: 4px;
                background-color: var(--text-active-color);
                transition: 0.4s;
            }

            input:checked+.switch-slider {
                background-color: var(--primary-color);
            }

            input:checked+.switch-slider:before {
                transform: translateX(30px);
            }

            .remove-button {
                position: absolute;
                opacity: 0.9;
                top: -10px;
                right: 0;
                background: var(--warning-color);
                color: var(--text-active-color);
                border: none;
                padding: 5px 10px;
                cursor: pointer;
                border-radius: 5px;
                font-size: 14px;
            }

            .remove-button:hover {
                opacity: 1;
            }

            .radio-button-group,
            .checkbox-group {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 15px;
            }

            .radio-button,
            .checkbox-group .chekbox-label {
                padding: 8px 23.5px;
                background-color: #e0e0e0;
                cursor: pointer;
                border-radius: 5px;
                font-size: 14px;
                font-weight: normal;
                min-width: 100px;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                height: 20px;
                margin: 0;
            }

            .radio-button.active,
            .checkbox-group input:checked+.chekbox-label {
                background-color: var(--primary-color);
                color: var(--text-active-color);
            }

            .radio-button:hover {
                background-color: var(--primary-color);
                color: var(--text-active-color);
            }

            .checkbox-group input[type="checkbox"] {
                display: none;
            }

            #language {
                padding: 8px;
                border-radius: 5px;
                cursor: pointer;
                width: 100%;
                border: 1px solid var(--border-color);
            }

            .parser {
                border: 1px solid var(--border-color);
                border-radius: 5px;
                padding: 10px 20px;
            }

            .parser textarea {
                margin-bottom: 10px;
                resize: none;
            }

            a {
                color: var(--text-color);
                text-decoration: none;
                font-weight: bold;
                transition: color 0.3s ease, border-bottom 0.3s ease;
                border-bottom: 2px solid transparent;
            }

            a:hover {
                color: var(--primary-color);
                border-bottom-color: var(--primary-color);
            }

            #tab-container {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                position: relative;
                border: 1px solid var(--border-color);
                border-radius: 5px;
                margin-bottom: 10px;
            }

            :disabled {
                opacity: 0.6;
            }

            div.disabled,
            button:disabled {
                pointer-events: none !important;
                cursor: not-allowed !important;
            }

            .parser textarea:disabled {
                height: 30px;
                overflow-y: hidden;
                line-height: 20px;
            }

            textarea:disabled::-webkit-scrollbar {
                display: none;
            }

            ::-webkit-scrollbar {
                width: 19px !important;
                height: 19px !important;
            }

            ::-webkit-scrollbar-thumb {
                background: var(--border-color) !important;
                border-radius: 5px !important;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: var(--primary-color) !important;
            }

            ::-webkit-scrollbar-track {
                background: rgb(245, 245, 245) !important;
                border-radius: 5px !important;
            }

            select:focus,
            input:focus,
            textarea:focus {
                border-color: var(--primary-color);
                outline: none;
            }

            #footer {
                font-size: 14px;
                height: 35px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            #footer svg {
                width: 20px;
                height: 20px;
                margin-bottom: -3px;
            }

            #footer a,
            #footer a:hover {
                margin-left: 3px;
                margin-right: 3px;
                font-weight: normal;
                border-bottom: none !important;
                text-decoration: none !important;
            }
        </style>
    </head>

    <body>
        <div id="sidebar-container">
            <div id="sidebar">
                <button id="global-button" class="tab-button active" data-tab="global">
                    <svg t="1732015880724" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="4317" width="32" height="32">
                        <path
                            d="M386.35 112.05h-228.7c-25.2 0-45.7 20.5-45.7 45.7v228.5c0 25.2 20.4 45.7 45.6 45.8h228.6c25.2 0 45.7-20.4 45.8-45.6V157.65c0.1-25.2-20.4-45.6-45.6-45.6z"
                            p-id="4318"></path>
                        <path
                            d="M157.55 80.05h229c42.8 0 77.5 34.7 77.5 77.5v229c0 42.8-34.7 77.5-77.5 77.5h-229c-42.8 0-77.5-34.7-77.5-77.5v-229c0-42.8 34.7-77.5 77.5-77.5z m228.9 320.5c7.8 0 14.1-6.3 14.1-14.1v-229c0-7.8-6.3-14.1-14.1-14.1h-229c-7.8 0-14.1 6.3-14.1 14.1v229c0 7.8 6.3 14.1 14.1 14.1h229z"
                            p-id="4319"></path>
                        <path
                            d="M387.55 590.25h-231.1c-25.5 0-46.2 20.7-46.2 46.2v231.1c0 25.5 20.7 46.2 46.2 46.2h231.1c25.5 0 46.2-20.7 46.2-46.2v-231.1c0-25.5-20.7-46.2-46.2-46.2z"
                            p-id="4320"></path>
                        <path
                            d="M157.55 560.05h229c42.8 0 77.5 34.7 77.5 77.5v229c0 42.8-34.7 77.5-77.5 77.5h-229c-42.8 0-77.5-34.7-77.5-77.5v-229c0-42.8 34.7-77.5 77.5-77.5z m228.9 320.5c7.8 0 14.1-6.3 14.1-14.1v-229c0-7.8-6.3-14.1-14.1-14.1h-229c-7.8 0-14.1 6.3-14.1 14.1v229c0 7.8 6.3 14.1 14.1 14.1h229zM637.55 80.05h229c42.8 0 77.5 34.7 77.5 77.5v229c0 42.8-34.7 77.5-77.5 77.5h-229c-42.8 0-77.5-34.7-77.5-77.5v-229c0-42.8 34.7-77.5 77.5-77.5z m228.9 320.5c7.8 0 14.1-6.3 14.1-14.1v-229c0-7.8-6.3-14.1-14.1-14.1h-229c-7.8 0-14.1 6.3-14.1 14.1v229c0 7.8 6.3 14.1 14.1 14.1h229z"
                            p-id="4321"></path>
                        <path
                            d="M866.306 592.006h-228.6c-25.2 0-45.7 20.5-45.7 45.7v228.5c0 25.2 20.5 45.7 45.7 45.7h228.5c25.2 0 45.7-20.4 45.8-45.6v-228.6c0-25.2-20.5-45.7-45.7-45.7z"
                            p-id="4322"></path>
                        <path
                            d="M637.506 560.006h229c42.8 0 77.5 34.7 77.5 77.5v229c0 42.8-34.7 77.5-77.5 77.5h-229c-42.8 0-77.5-34.7-77.5-77.5v-229c0-42.8 34.7-77.5 77.5-77.5z m229 320.6c7.8 0 14.1-6.3 14.1-14.1v-229c0-7.8-6.3-14.1-14.1-14.1h-229c-7.8 0-14.1 6.3-14.1 14.1v229c0 7.8 6.3 14.1 14.1 14.1h229z"
                            p-id="4323"></path>
                    </svg>
                    <span data-translate="global">全局配置</span>
                </button>
            </div>
            <button id="add-tab-button">+</button>
        </div>

        <div id="content-container">
            <div id="content">
                <div id="global" class="tab active">
                    <div class="input-group">
                        <label data-translate="version">版本</label>
                        <input type="text" id="version" readonly></input>
                    </div>
                    <div class="input-group">
                        <label data-translate="language">语言</label>
                        <select id="language">
                            <option value="zh" selected>中文</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label data-translate="buttonCoord">按钮坐标</label>
                        <label>
                            <input type="number" id="buttonXCoord" min="0" placeholder="0">
                            <input type="number" id="buttonYCoord" min="0" placeholder="0">
                            <button id="reset-button-coord-button" class="reset-button" data-translate="reset">重置</button>
                        </label>
                    </div>
                    <div class="input-group">
                        <label data-translate="buttonScale">按钮比例</label>
                        <input type="number" id="buttonScale" min="0.01" max="10" step="0.01" placeholder="1.00">
                    </div>
                    <div class="input-group">
                        <label data-translate="buttonVisibilityDuration">按钮可见时长（毫秒，-1：一直可见）</label>
                        <input type="number" id="buttonVisibilityDuration" min="-1" placeholder="3000">
                    </div>
                    <div class="input-group">
                        <label data-translate="networkProxy">网络代理</label>
                        <input type="text" id="networkProxy" placeholder="http://127.0.0.1:7890"></input>
                    </div>
                    <label data-translate="parser">解析器</label>
                    <div class="input-group parser" id="ytdlp">
                        <label><a href="https://github.com/yt-dlp/yt-dlp" target="_blank">YTDLP</a></label>
                        <textarea name="regex" disabled></textarea>
                        <textarea name="regex"></textarea>
                        <label data-translate="preferredQuality">首选画质</label>
                        <div class="radio-button-group" name="preferredQuality">
                            <div class="radio-button active" value="unlimited" data-translate="unlimited">无限制</div>
                            <div class="radio-button" value="2160">2160P</div>
                            <div class="radio-button" value="1440">1440P</div>
                            <div class="radio-button" value="1080">1080P</div>
                            <div class="radio-button" value="720">720P</div>
                        </div>
                    </div>
                    <div class="input-group parser" id="video">
                        <label><a href="https://github.com/LuckyPuppy514/external-player" target="_blank">VIDEO</a></label>
                        <textarea name="regex" disabled></textarea>
                        <textarea name="regex"></textarea>
                    </div>
                    <div class="input-group parser" id="url">
                        <label><a href="https://github.com/LuckyPuppy514/external-player" target="_blank">URL</a></label>
                        <textarea name="regex" disabled></textarea>
                        <textarea name="regex"></textarea>
                    </div>
                    <div class="input-group parser" id="html">
                        <label><a href="https://github.com/LuckyPuppy514/external-player" target="_blank">HTML</a></label>
                        <textarea name="regex" disabled></textarea>
                        <textarea name="regex"></textarea>
                    </div>
                    <div class="input-group parser" id="script">
                        <label><a href="https://github.com/LuckyPuppy514/external-player" target="_blank">SCRIPT</a></label>
                        <textarea name="regex" disabled></textarea>
                        <textarea name="regex"></textarea>
                    </div>
                    <div class="input-group parser" id="request">
                        <label><a href="https://github.com/LuckyPuppy514/external-player"
                                target="_blank">REQUEST</a></label>
                        <textarea name="regex" disabled></textarea>
                        <textarea name="regex"></textarea>
                    </div>
                    <div class="input-group parser" id="bilibili">
                        <label><a href="https://github.com/SocialSisterYi/bilibili-API-collect"
                                target="_blank">BILIBILI</a></label>
                        <textarea name="regex" disabled></textarea>
                        <textarea name="regex" style="display: none;"></textarea>
                        <label data-translate="preferredQuality">首选画质</label>
                        <div class="radio-button-group" name="preferredQuality">
                            <div class="radio-button active" value="127" data-translate="unlimited">无限制</div>
                            <div class="radio-button" value="126">2160P</div>
                            <div class="radio-button" value="116">1080P</div>
                            <div class="radio-button" value="74">720P</div>
                        </div>
                        <label data-translate="preferredSubtitle">首选字幕</label>
                        <div class="radio-button-group" name="preferredSubtitle">
                            <div class="radio-button active" value="off" data-translate="off">关闭</div>
                            <div class="radio-button" value="zh-Hans">简体</div>
                            <div class="radio-button" value="zh-Hant">繁体</div>
                            <div class="radio-button" value="en-US">English</div>
                        </div>
                        <label data-translate="preferredCodec">首选编码</label>
                        <div class="radio-button-group" name="preferredCodec">
                            <div class="radio-button active" value="12">HEVC</div>
                            <div class="radio-button" value="13">AV1</div>
                            <div class="radio-button" value="7">AVC</div>
                        </div>
                    </div>
                    <div class="input-group parser" id="bilibiliLive">
                        <label><a href="https://github.com/SocialSisterYi/bilibili-API-collect" target="_blank">BILIBILI
                                LIVE</a></label>
                        <textarea name="regex" disabled></textarea>
                        <textarea name="regex" style="display: none;"></textarea>
                        <label data-translate="preferredQuality">首选画质</label>
                        <div class="radio-button-group" name="preferredQuality">
                            <div class="radio-button active" value="4" data-translate="original">原画</div>
                            <div class="radio-button active" value="3" data-translate="hd">高清</div>
                            <div class="radio-button active" value="2" data-translate="smooth">流畅</div>
                        </div>
                        <label data-translate="preferredLine">首选线路</label>
                        <div class="radio-button-group" name="preferredLine">
                            <div class="radio-button active" value="0" data-translate="mainLine">主线</div>
                            <div class="radio-button active" value="1" data-translate="backupLine1">备线1</div>
                            <div class="radio-button active" value="2" data-translate="backupLine2">备线2</div>
                            <div class="radio-button active" value="3" data-translate="backupLine3">备线3</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin: 0 auto;">
                <button id="save-button" data-translate="save">保存</button>
                <button id="reset-button" class="reset-button" data-translate="reset">重置</button>
            </div>

            <div id="footer">
                <span>
                    <a href="https://github.com/LuckyPuppy514" target="_blank">
                        &copy 2024 LuckyPuppy514
                    </a>
                    <svg t="1731923678389" class="icon" viewBox="0 0 1024 1024" version="1.1"
                        xmlns="http://www.w3.org/2000/svg" p-id="5894" width="32" height="32">
                        <path
                            d="M20.48 503.72608c0 214.4256 137.4208 396.73856 328.94976 463.6672 25.8048 6.5536 21.87264-11.8784 21.87264-24.33024v-85.07392c-148.93056 17.44896-154.86976-81.1008-164.94592-97.52576-20.23424-34.52928-67.91168-43.33568-53.69856-59.76064 33.91488-17.44896 68.48512 4.42368 108.46208 63.61088 28.95872 42.88512 85.44256 35.6352 114.15552 28.4672a138.8544 138.8544 0 0 1 38.0928-66.7648c-154.25536-27.60704-218.60352-121.77408-218.60352-233.79968 0-54.31296 17.94048-104.2432 53.0432-144.54784-22.36416-66.43712 2.08896-123.24864 5.3248-131.6864 63.81568-5.7344 130.00704 45.6704 135.168 49.68448 36.2496-9.78944 77.57824-14.9504 123.82208-14.9504 46.4896 0 88.064 5.3248 124.5184 15.23712 12.288-9.4208 73.80992-53.53472 133.12-48.128 3.15392 8.43776 27.0336 63.93856 6.02112 129.4336 35.59424 40.38656 53.69856 90.76736 53.69856 145.24416 0 112.18944-64.7168 206.4384-219.42272 233.71776a140.0832 140.0832 0 0 1 41.7792 99.9424v123.4944c0.86016 9.87136 0 19.6608 16.50688 19.6608 194.31424-65.49504 334.2336-249.15968 334.2336-465.5104C1002.57792 232.48896 782.66368 12.77952 511.5904 12.77952 240.18944 12.65664 20.48 232.40704 20.48 503.72608z"
                            fill="#000000" opacity=".65" p-id="5895"></path>
                    </svg>
                    <a href="https://github.com/LuckyPuppy514/external-player" target="_blank">
                        Powered by External Player
                    </a>
                </span>
            </div>
        </div>
    </body>
    <script>
        const translations = {
            en: {
                global: 'Global Config',
                version: 'Version',
                language: 'Language',
                buttonCoord: 'Button Coord',
                buttonScale: 'Button Scale',
                buttonVisibilityDuration: 'Button Visibility Duration (ms, -1: Keep Visible)',
                networkProxy: 'Network Proxy',
                reset: 'Reset',
                save: 'Save',
                delete: 'Delete',
                name: 'Name',
                system: 'System',
                icon: 'Icon',
                iconSize: 'Icon Size',
                playEvent: 'Play Event',
                enable: 'Enable',
                parser: 'Parser',
                preferredQuality: 'Preferred Quality',
                preferredSubtitle: 'Preferred Subtitle',
                preferredCodec: 'Preferred Codec',
                preferredLine: 'Preferred Line',
                original: 'Original',
                hd: 'HD',
                smooth: 'Smooth',
                mainLine: 'Main',
                backupLine1: 'Backup 1',
                backupLine2: 'Backup 2',
                backupLine3: 'Backup 3',
                unlimited: 'Unlimited',
                off: 'OFF'
            },
            zh: {
                global: '全局配置',
                version: '版本',
                language: '语言',
                buttonCoord: '按钮坐标',
                buttonScale: '按钮比例',
                buttonVisibilityDuration: '按钮可见时长（毫秒，-1：一直可见）',
                networkProxy: '网络代理',
                reset: '重置',
                save: '保存',
                delete: '删除',
                name: '名称',
                system: '系统',
                icon: '图标',
                iconSize: '图标大小',
                playEvent: '播放事件',
                enable: '启用',
                parser: '解析器',
                preferredQuality: '首选画质',
                preferredSubtitle: '首选字幕',
                preferredCodec: '首选编码',
                preferredLine: '首选线路',
                original: '原画',
                hd: '高清',
                smooth: '流畅',
                mainLine: '主线',
                backupLine1: '备线1',
                backupLine2: '备线2',
                backupLine3: '备线3',
                unlimited: '无限制',
                off: '关闭',
            }
        };

        const SYSTEM_SVG = {
            windows: '<svg t="1732017849573" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5376" width="32" height="32"><path d="M523.8 191.4v288.9h382V128.1zM523.8 833.6l382 62.2v-352h-382zM120.1 480.2H443V201.9l-322.9 53.5zM120.1 770.6L443 823.2V543.8H120.1z" p-id="5377"></path></svg>',
            linux: '<svg t="1732017810402" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4326" width="32" height="32"><path d="M834.198588 918.588235c-30.659765 15.661176-71.559529 50.115765-86.618353 64.572236-11.324235 10.782118-58.066824 16.203294-84.449882 2.710588-30.659765-15.661176-14.516706-40.417882-61.861647-41.923765-23.672471-0.602353-46.802824-0.602353-69.933177-0.602353-20.419765 0.602353-40.839529 1.626353-61.861647 2.108235-70.957176 1.626353-77.944471 47.405176-123.723294 45.778824-31.201882-1.084235-70.415059-25.840941-138.24-39.755294-47.344941-9.758118-93.003294-12.348235-102.761412-33.370353-9.637647-21.022118 11.866353-44.634353 13.432471-65.054118 1.626353-27.467294-20.419765-64.572235-4.276706-78.607059 13.974588-12.348235 43.550118-3.252706 62.885647-13.914352 20.419765-11.806118 29.033412-21.022118 29.033412-46.260706 7.529412 25.720471-0.542118 46.682353-17.227294 56.922353-10.24 6.445176-29.033412 9.697882-44.694588 8.131764-12.348235-1.144471-19.877647 0.481882-23.130353 5.360941-4.818824 5.903059-3.252706 16.685176 2.710588 30.659765 5.903059 13.974588 12.890353 23.130353 11.806118 40.297412-0.542118 17.227294-19.877647 37.707294-16.624942 52.224 1.084235 5.421176 6.445176 10.24 19.877647 13.974588 21.504 5.903059 60.777412 11.806118 98.966589 21.022118 42.526118 10.721882 86.618353 30.057412 114.085647 26.322823 81.739294-11.324235 34.936471-98.966588 22.046117-119.868235-69.391059-108.724706-115.109647-179.681882-151.67247-151.732706-9.155765 7.529412-9.697882-18.311529-9.155765-28.551529 1.626353-35.538824 19.395765-48.368941 30.117647-75.836236 20.419765-52.224 36.020706-111.856941 67.222588-142.516705 23.311059-30.177882 59.873882-79.088941 66.921412-104.869647-5.963294-55.958588-7.589647-115.109647-8.613647-166.671059-1.084235-55.416471 7.529412-103.905882 69.933177-137.697883C453.391059 33.310118 473.268706 30.117647 494.290824 30.117647c37.104941-0.602353 78.486588 10.24 104.869647 29.575529 41.984 31.201882 68.306824 97.340235 65.114353 144.624942-2.168471 37.104941 4.276706 75.294118 16.143058 115.109647 13.974588 46.802824 36.080941 79.570824 71.55953 117.217882 42.526118 45.176471 75.836235 133.903059 85.534117 190.343529 8.613647 52.826353-3.252706 85.594353-14.516705 87.220706-17.227294 2.590118-27.949176 56.922353-81.739295 54.814118-34.394353-1.626353-37.647059-22.046118-47.344941-39.815529-15.600941-27.407059-31.201882-18.793412-37.104941 10.24-3.252706 14.516706-1.144471 36.080941 3.734588 52.103529 9.697882 33.912471 6.445176 65.656471 0.542118 104.929882-11.324235 74.209882 52.163765 88.184471 94.689882 52.645647 41.923765-34.876235 51.079529-40.297412 103.785412-58.608941 80.112941-27.467294 53.248-51.621647 10.179765-66.138353-38.731294-12.950588-40.297412-78.064941-26.383059-90.413176 3.252706 69.933176 39.815529 80.173176 54.874353 89.810823 66.138353 41.020235-24.756706 74.932706-64.030118 94.810353z m-90.352941-259.734588c14.516706-48.489412 8.071529-67.764706-1.566118-113.543529-7.529412-34.394353-39.273412-81.257412-64.030117-95.713883 6.445176 5.360941 18.311529 20.961882 30.659764 44.574118 21.504 40.417882 43.008 100.050824 29.033412 149.564235-5.360941 19.275294-18.251294 21.985882-26.864941 22.528-37.647059 4.336941-15.600941-45.176471-31.201882-112.338823-17.769412-75.354353-36.020706-80.715294-40.297412-86.618353-22.166588-97.822118-46.320941-88.124235-53.368471-124.687059-5.903059-32.828235 28.551529-59.693176-18.251294-68.848941-14.516706-2.710588-34.936471-17.227294-43.008-18.31153-8.071529-1.024-12.408471-54.332235 17.709177-55.958588 29.575529-2.168471 34.996706 33.370353 29.575529 47.405177-8.553412 13.914353 0.542118 19.335529 15.119059 14.45647 11.806118-3.734588 4.276706-34.936471 6.987294-39.213176-7.529412-45.176471-26.383059-51.621647-45.718588-55.416471-74.270118 5.903059-40.899765 87.702588-48.429177 80.173177-10.782118-11.324235-41.923765-1.084235-41.923764-8.131765 0.542118-41.923765-13.492706-66.138353-32.828236-66.680471-21.504-0.542118-30.117647 29.575529-31.201882 46.742589-1.626353 16.143059 9.155765 50.115765 17.227294 47.405176 5.360941-1.626353 14.516706-12.408471 4.818824-11.806118-4.818824 0-12.348235-11.866353-13.432471-25.840941-0.542118-14.034824 4.879059-28.009412 23.130353-27.467294 20.961882 0.542118 20.961882 42.465882 18.793412 44.092235-6.927059 4.818824-15.600941 14.034824-16.685177 15.600942-6.927059 11.324235-20.359529 14.456471-25.780706 19.395764-9.155765 9.637647-11.264 20.419765-4.276705 24.154353 24.696471 13.974588 16.624941 30.057412 51.079529 31.262118 22.588235 1.084235 39.213176-3.252706 54.874353-8.07153 11.806118-3.734588 50.055529-11.806118 58.066823-25.840941 3.734588-5.903059 8.071529-5.903059 10.721883-4.276706 5.360941 2.650353 6.445176 12.890353-6.987294 16.143059-18.793412 5.421176-37.647059 15.661176-54.814118 22.106353-16.685176 6.927059-22.046118 9.637647-37.647059 12.288-35.478588 6.445176-61.801412-12.890353-38.189176 10.24 8.071529 7.529412 15.600941 12.348235 36.020706 11.866353 45.176471-1.626353 95.232-56.018824 100.050823-31.804235 1.024 5.360941-14.034824 11.806118-25.840941 17.769412-41.923765 20.419765-71.499294 61.319529-98.424471 47.284705-24.214588-12.890353-48.368941-72.643765-47.887058-45.658353 0.542118 41.381647-54.332235 77.944471-29.033412 125.289412-16.685176 4.216471-53.790118 83.365647-59.151059 124.205177-3.252706 23.672471 2.168471 52.705882-3.794824 68.848941-8.071529 23.672471-44.634353-22.588235-32.768-79.028706 2.108235-9.637647 0-11.866353-2.710588-6.927059-14.516706 26.322824-6.445176 63.427765 5.360941 89.208471 4.879059 11.324235 17.227294 16.143059 26.383059 25.840941 18.793412 21.443765 93.003294 76.378353 105.953883 89.810823a33.008941 33.008941 0 0 1-22.588236 55.898353c17.769412 33.370353 34.936471 36.623059 34.454588 90.895059 20.419765-10.721882 12.408471-34.394353 3.734589-49.392941-5.963294-10.842353-13.432471-15.661176-11.866353-18.311529 1.084235-1.626353 11.866353-10.842353 17.769412-3.734589 18.251294 20.419765 52.705882 24.154353 89.268705 19.33553 37.104941-4.336941 76.920471-17.227294 95.171765-46.802824 8.613647-13.974588 14.516706-18.793412 18.31153-16.143059 4.276706 2.108235 5.963294 11.806118 5.360941 27.949177-0.542118 17.227294-7.529412 34.996706-12.348236 49.513412-4.879059 16.685176-6.445176 27.949176 9.697883 28.551529 4.276706-30.177882 12.890353-59.753412 15.058823-89.871059 2.710588-34.394353-22.046118-97.822118 4.879059-129.626353 6.987294-8.613647 15.540706-9.637647 27.407059-9.637647 1.566118-43.068235 67.764706-39.755294 89.810823-22.046117 0-9.758118-20.961882-18.853647-29.575529-22.648471zM304.971294 503.988706c-3.794824 6.927059-13.432471 12.288-5.963294 13.43247 2.710588 0.542118 10.24-6.023529 13.492706-13.43247 2.650353-9.155765 5.360941-14.034824 1.084235-15.661177-4.879059-1.566118-3.794824 8.071529-8.613647 15.661177z m123.120941-291.538824c-6.445176-1.626353-5.360941 8.011294-2.108235 6.987294 2.168471 0 4.879059 3.252706 3.734588 8.07153-1.084235 6.445176-0.542118 10.842353 4.336941 10.842353 0.542118 0 1.566118 0 1.566118-1.626353 2.228706-13.552941-4.276706-23.190588-7.529412-24.274824z m14.576941 49.453177c-5.360941 0.542118-4.336941-11.866353 12.890353-10.782118-10.782118 1.084235-6.987294 10.782118-12.890353 10.782118z m44.092236-9.155765c15.600941-6.927059 20.961882 3.794824 15.600941 5.963294-5.421176 1.566118-5.963294-8.673882-15.600941-5.963294z m65.054117-43.550118c-6.987294 0.602353-4.818824 3.734588-1.566117 4.818824 4.276706 1.204706 8.613647 8.673882 9.697882 16.685176 0 1.084235 5.360941-1.084235 5.360941-2.710588 0.481882-12.830118-10.782118-19.275294-13.492706-18.793412z m31.201883-116.133647c-4.276706-4.336941-8.613647-8.131765-12.890353-8.131764-10.782118 1.084235-5.421176 12.348235-6.987294 17.769411-2.168471 5.903059-10.179765 10.782118-4.818824 15.058824 4.879059 3.734588 8.071529-5.903059 18.31153-9.637647 2.650353-1.144471 15.058824 0.481882 17.709176-5.421177 0.481882-2.710588-6.445176-5.903059-11.324235-9.637647z m59.693176 237.628236c-10.179765-6.384941-12.348235-17.167059-16.082823-13.432471-11.324235 12.348235 13.974588 38.189176 24.69647 40.417882 6.445176 1.084235 11.324235-7.589647 9.697883-15.119058-2.168471-10.179765-9.697882-6.445176-18.31153-11.866353z" p-id="4327"></path></svg>',
            mac: '<svg t="1731999754869" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7764" width="32" height="32"><path d="M849.124134 704.896288c-1.040702 3.157923-17.300015 59.872622-57.250912 118.190843-34.577516 50.305733-70.331835 101.018741-126.801964 101.909018-55.532781 0.976234-73.303516-33.134655-136.707568-33.134655-63.323211 0-83.23061 32.244378-135.712915 34.110889-54.254671 2.220574-96.003518-54.951543-130.712017-105.011682-70.934562-102.549607-125.552507-290.600541-52.30118-416.625816 36.040844-63.055105 100.821243-103.135962 171.364903-104.230899 53.160757-1.004887 103.739712 36.012192 136.028093 36.012192 33.171494 0 94.357018-44.791136 158.90615-38.089503 27.02654 1.151219 102.622262 11.298324 151.328567 81.891102-3.832282 2.607384-90.452081 53.724599-89.487104 157.76107C739.079832 663.275355 847.952448 704.467523 849.124134 704.896288M633.69669 230.749408c29.107945-35.506678 48.235584-84.314291 43.202964-132.785236-41.560558 1.630127-92.196819 27.600615-122.291231 62.896492-26.609031 30.794353-50.062186 80.362282-43.521213 128.270409C557.264926 291.935955 604.745311 264.949324 633.69669 230.749408" p-id="7765"></path></svg>'
        };

        const policy = window.trustedTypes.createPolicy('default', {
            createHTML: (string, sink) => string
        })

        var defaultConfig;
        var tabCount = 0;

        function translatePage(language) {
            const trans = translations[language];
            document.querySelectorAll('[data-translate]').forEach(el => {
                el.textContent = trans[el.getAttribute('data-translate')] || el.textContent;
            });
        }

        function createTab(tabId, tabName = \`Player \${tabCount}\`, config = {}) {
            const tabButton = document.createElement('button');
            tabButton.className = 'tab-button';
            tabButton.textContent = tabName;
            tabButton.dataset.tab = tabId;
            sidebar.insertBefore(tabButton, document.getElementById('global-button').nextSibling);

            const tab = document.createElement('div');
            tab.id = tabId;
            tab.name = tabName;
            tab.className = 'tab';
            tab.setAttribute('readonly', config.readonly === true)
            const disabled = config.readonly === true ? 'disabled' : '';
            config.presetEvent = config.presetEvent || {
                pauseAuto: true
            };
            tab.innerHTML = policy.createHTML(\`
                <div class="header">
                    <button class="remove-button" data-translate="delete" \${disabled}>删除</button>
                </div>
                <div class="input-group">
                    <label data-translate="name">名称</label>
                    <input type="text" value="\${config.name || tabName}" name="name" placeholder="\${tabName}" required \${disabled}>
                </div>
                <div class="input-group">
                    <label data-translate="system">系统</label>
                    <div class="radio-button-group" name="system">
                        <div class="radio-button active \${disabled}" value="windows">\${SYSTEM_SVG.windows} Windows</div>
                        <div class="radio-button \${disabled}" value="linux">\${SYSTEM_SVG.linux} Linux</div>
                        <div class="radio-button \${disabled}" value="mac">\${SYSTEM_SVG.mac} Mac</div>
                    </div>
                </div>
                <div class="input-group">
                    <label data-translate="iconSize">图标大小</label>
                    <input type="number" value="\${config.iconSize || 50}" name="iconSize" min="1" required>
                </div>
                <div class="input-group">
                    <label data-translate="icon">图标</label>
                    <input type="search" value="\${config.icon || ''}" list="icon-list" name="icon" required>
                    <datalist id="icon-list">
                        <option value="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGU4DoFouNX7OYb16a7XBAx_dXV3OgzcXc7A&s">MPV</option>
                        <option value="https://images.dwncdn.net/images/t_app-icon-l/p/ab54d4c6-a4d2-11e6-99a6-00163ec9f5fa/1236096272/potplayer-32bit-logo">PotPlayer</option>
                        <option value="https://upload.wikimedia.org/wikipedia/commons/5/51/IINA_Logo.png">IINA</option>
                    </datalist>
                </div>
                <div class="input-group">
                    <label data-translate="presetEvent">预设事件</label>
                    <div class="checkbox-group">
                        <input type="checkbox" id="\${tabId}-play-auto" name="playAuto" \${config.presetEvent.playAuto ? 'checked' : ''}/>
                        <label for="\${tabId}-play-auto" data-translate="playAuto" class="chekbox-label">自动播放</label>
                        <input type="checkbox" id="\${tabId}-pause-auto" name="pauseAuto"  \${config.presetEvent.pauseAuto ? 'checked' : ''}/>
                        <label for="\${tabId}-pause-auto" data-translate="pauseAuto" class="chekbox-label">自动暂停</label>
                        <input type="checkbox" id="\${tabId}-close-auto" name="closeAuto"  \${config.presetEvent.closeAuto ? 'checked' : ''}/>
                        <label for="\${tabId}-close-auto" data-translate="closeAuto" class="chekbox-label">自动关闭</label>
                    </div>
                </div>
                <div class="input-group">
                    <label data-translate="playEvent">播放事件</label>
                    <textarea class="tab-textarea" wrap="off" \${disabled} name="playEvent">\${config.playEvent || ''}</textarea>
                </div>
                <div class="input-group">
                    <label data-translate="enable">启用</label>
                    <label class="switch">
                        <input type="checkbox" class="tab-switch" \${config.enable || config.enable === undefined ? 'checked' : ''} name="enable"><span class="switch-slider"></span>
                    </label>
                </div>
            \`);
            content.appendChild(tab);

            tab.querySelector('.remove-button').onclick = () => {
                const previousElement = tabButton.previousElementSibling;
                sidebar.removeChild(tabButton);
                content.removeChild(tab);
                activateTab(previousElement.getAttribute('data-tab'));
            };

            const nameInput = tab.querySelector('[name="name"]');
            nameInput.oninput = () => {
                tabButton.innerHTML = SYSTEM_SVG[tab.querySelector('[name=system] .active').getAttribute('value')] + (
                    nameInput.value || tabName);
            };

            config.system = config.system || 'windows';
            tab.querySelectorAll('[name=system]').forEach(radioButtonGroup => {
                const radioButtons = radioButtonGroup.querySelectorAll('.radio-button');
                radioButtons.forEach(radioButton => {
                    radioButton.onclick = () => {
                        radioButtons.forEach(btn => btn.classList.remove('active'));
                        radioButton.classList.add('active');
                        tabButton.innerHTML = SYSTEM_SVG[radioButton.getAttribute('value')] + (nameInput
                            .value || tabName);
                    };
                    if (radioButton.getAttribute('value') === config.system) {
                        radioButton.classList.add('active');
                        tabButton.innerHTML = SYSTEM_SVG[radioButton.getAttribute('value')] + (nameInput
                            .value || tabName);
                    } else {
                        radioButton.classList.remove('active');
                    }
                });
            })

            tabButton.onclick = () => activateTab(tabId);

            activateTab(tabId);
        }

        function activateTab(tabId) {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            document.querySelector(\`[data-tab="\${tabId}"]\`).classList.add('active');
            document.querySelector('#content').scrollTop = 0;
        }

        function saveConfig() {
            const ytdlp = document.querySelector('#ytdlp');
            const ytdlpRegex = ytdlp.querySelector('[name="regex"]:not([disabled])').value;

            const bilibili = document.querySelector('#bilibili');
            const bilibiliRegex = bilibili.querySelector('[name="regex"]:not([disabled])').value;

            const config = {
                global: {
                    parser: {}
                },
                players: []
            };

            for (const id in defaultConfig.global.parser) {
                const parser = document.getElementById(id);
                const regex = parser.querySelector('[name="regex"]:not([disabled])').value;
                config.global.parser[id] = {};
                config.global.parser[id].regex = regex ? regex.split('\\n') : [];
                for (const name in defaultConfig.global.parser[id]) {
                    if (name === 'regex') {
                        continue;
                    }
                    config.global.parser[id][name] = parser.querySelector(\`[name=\${name}] .active\`).getAttribute('value');
                }
            }

            for (const key in defaultConfig.global) {
                if (key === 'parser') {
                    continue;
                }
                config.global[key] = document.getElementById(key)?.value || defaultConfig.global[key];
            }

            document.querySelectorAll('.tab').forEach(tab => {
                if (tab.id !== 'global') {
                    config.players.push({
                        readonly: tab.getAttribute('readonly') === "true",
                        name: tab.querySelector('[name="name"]').value || tab.name || 'Player',
                        system: tab.querySelector('[name="system"] .active').getAttribute('value') ||
                            'windows',
                        icon: tab.querySelector('[name="icon"]').value || '',
                        iconSize: tab.querySelector('[name="iconSize"]').value || 50,
                        playEvent: tab.querySelector('[name="playEvent"]').value || '',
                        presetEvent: {
                            playAuto: tab.querySelector('[name="playAuto"]').checked,
                            pauseAuto: tab.querySelector('[name="pauseAuto"]').checked,
                            closeAuto: tab.querySelector('[name="closeAuto"]').checked,
                        },
                        enable: tab.querySelector('[name="enable"]').checked,
                    });
                }
            });

            if (window.self === window.top) {
                localStorage.setItem('config', JSON.stringify(config));
            } else {
                parent.postMessage(config, '*');
            }
        };

        function resetButtonCoord() {
            document.getElementById('buttonXCoord').value = defaultConfig.global.buttonXCoord;
            document.getElementById('buttonYCoord').value = defaultConfig.global.buttonYCoord;
        }

        function loadConfig(config) {
            // 全局配置
            for (const key in config.global) {
                if (key === 'parser' || !document.getElementById(key)) {
                    continue;
                }
                document.getElementById(key).value = config.global[key];
            }

            document.getElementById('language').value = config.global.language;
            language.dispatchEvent(new Event("change"));

            document.querySelectorAll('.parser').forEach(parser => {
                parser.querySelectorAll('.radio-button-group').forEach(radioButtonGroup => {
                    const radioButtons = radioButtonGroup.querySelectorAll('.radio-button');
                    radioButtons.forEach(radioButton => {
                        if (radioButton.getAttribute('value') === config.global.parser[parser.id][
                            radioButtonGroup.getAttribute('name')
                        ]) {
                            radioButton.classList.add('active');
                        } else {
                            radioButton.classList.remove('active');
                        }
                    });
                })
                parser.querySelectorAll('textarea').forEach(textarea => {
                    if (textarea.disabled) {
                        const regex = defaultConfig.global.parser[parser.id][textarea.getAttribute(
                            'name')] || [];
                        if (regex.length > 0) {
                            textarea.value = regex.join('\\n');
                            textarea.style.height = regex.length * 20 + 20 + 'px';
                        } else {
                            textarea.style.display = 'none';
                        }
                    } else {
                        const regex = config.global.parser[parser.id][textarea.getAttribute('name')] || [];
                        textarea.value = regex.join('\\n');
                    }
                })
            })

            // 播放器配置
            removeAllTab();
            config.players.forEach(player => createTab(\`player\${tabCount++}\`, player.name, player));

            // 默认选中全局配置
            activateTab('global');
        }

        function removeAllTab() {
            document.querySelectorAll('.tab-button').forEach(tabButton => {
                if (tabButton.id === 'global-button') {
                    return;
                }
                sidebar.removeChild(tabButton);
            })
            document.querySelectorAll('.tab').forEach(tab => {
                if (tab.id === 'global') {
                    return;
                }
                content.removeChild(tab);
            })
        }

        function resetConfig() {
            let config = JSON.parse(JSON.stringify(defaultConfig));
            for (const key in config.global.parser) {
                config.global.parser[key].regex = [];
            }
            loadConfig(config);
        }

        function init() {
            if (window.self === window.top) {
                return;
            }

            window.addEventListener('message', function (event) {
                if (event.data.defaultConfig && event.data.config) {
                    defaultConfig = event.data.defaultConfig;
                    loadConfig(event.data.config);
                    document.getElementById('sidebar-container').style.display = 'flex';
                    document.getElementById('content-container').style.display = 'flex';
                }
            });

            document.getElementById('language').addEventListener('change', (e) => {
                translatePage(e.target.value);
            });
            document.getElementById('add-tab-button').onclick = () => createTab(\`tab\${tabCount++}\`);
            document.getElementById('global-button').onclick = () => activateTab('global');
            document.getElementById('save-button').onclick = () => saveConfig();
            document.getElementById('reset-button').onclick = () => resetConfig();
            document.getElementById('reset-button-coord-button').onclick = () => resetButtonCoord();

            document.querySelectorAll('#global .radio-button-group').forEach(radioButtonGroup => {
                const radioButtons = radioButtonGroup.querySelectorAll('.radio-button');
                radioButtons.forEach(radioButton => {
                    radioButton.onclick = () => {
                        radioButtons.forEach(btn => btn.classList.remove('active'));
                        radioButton.classList.add('active');
                    };
                });
            })
        }

        init();
    </script>

    </html>
    `;
    if (SETTING_URL) {
        const response = await fetch(SETTING_URL);
        settingIframeHtml = await response.text();
    }
    settingIframe.onload = function () {
        const doc = settingIframe.contentDocument || settingIframe.contentWindow.document;
        doc.open();
        doc.write(policy.createHTML(settingIframeHtml));
        doc.close();
    };
    document.body.appendChild(settingIframe);

    window.addEventListener('message', function (event) {
        if (event.data && event.data.global) {
            // 保存配置
            currentConfig = event.data;
            GM_setValue('config', currentConfig);
            showToast(translation.saveSuccessfully);

            // 移除旧元素
            document.head.removeChild(style);
            document.body.removeChild(buttonDiv);
            style = undefined;
            buttonDiv = undefined;

            // 重新初始化
            isReloading = true;
            init(currentUrl);
        }
    });

    try {
        showLoading();
        await sleep(REFRESH_INTERVAL);
    } finally {
        hideLoading();
    }
}

function startFlashing(element) {
    let visibility = element.style.visibility;
    let transition = element.style.transition;
    let boxShadow = element.style.boxShadow;

    element.style.visibility = 'visible';
    element.style.transition = 'box-shadow 0.5s ease';
    let isGlowing = false;
    const interval = setInterval(() => {
        isGlowing = !isGlowing;
        element.style.boxShadow = isGlowing ? `0 0 10px 10px ${COLOR.PRIMARY}` : 'none';
    }, 500);

    setTimeout(() => {
        clearInterval(interval);
        element.style.visibility = visibility;
        element.transition = transition;
        element.boxShadow = boxShadow;
    }, 5000);
}

// ======================================== 开始执行 =======================================

function init(url) {
    currentConfig = loadConfig();
    translation = translations[currentConfig.global.language];
    appendCss();
    appendToastDiv();
    appendLoadingDiv();
    appendButtonDiv();
    currentParser = matchParser(currentConfig.global.parser, url) || matchParser(defaultConfig.global.parser, url);
    if (currentParser) {
        buttonDiv.style.display = 'flex';
        if (!isReloading) {
            for (const player of currentConfig.players) {
                if (player.presetEvent.playAuto === true) {
                    currentParser.play(player);
                }
            }
        }
        isReloading = false;
    }
    currentUrl = url;
}

onload = () => {
    setInterval(() => {
        const url = location.href;
        if (currentUrl !== url || !buttonDiv) {
            console.log(`current url update: ${currentUrl ? currentUrl + ' => ' : ''}${url}`);
            init(url);
        }
    }, REFRESH_INTERVAL);

    // 快捷键
    document.addEventListener('keydown', (event) => {
        // 打开设置：Ctrl + Alt + E
        if (event.ctrlKey && event.altKey && (event.key === 'e' || event.key === 'E')) {
            event.preventDefault();
            startFlashing(settingButton);
            settingButton.click();
        }
    });
};