// player.js
$(function() {
    var playerTrack = $("#player-track"),
        bgArtwork = $('#bg-artwork'),
        bgArtworkUrl, albumName = $('#album-name'),
        trackName = $('#track-name'),
        albumArt = $('#album-art'),
        sArea = $('#s-area'),
        seekBar = $('#seek-bar'),
        trackTime = $('#track-time'),
        insTime = $('#ins-time'),
        sHover = $('#s-hover'),
        playPauseButton = $("#play-pause-button"),
        i = playPauseButton.find('i'),
        tProgress = $('#current-time'),
        tTime = $('#track-length'),
        seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds,
        durMinutes, durSeconds, playProgress, bTime,
        nTime = 0,
        buffInterval = null,
        tFlag = false,
        albums = ['Dawn', 'Me & You', 'Electro Boy', 'Home', 'Eclipse', 'Paradise'],
        trackNames = ['Skylike - Dawn', 'Alex Skrindo - Me & You', 'Kaibu - Electro Boy', 'Tobu & Syndec - Home', 'Alan Walker - Eclipse', 'Tobu - Paradise'],
        albumArtworks = ['_1', '_2', '_3', '_4', '_5', '_6'],
        // 关键修改：tracks 数组现在包含外部 URL
        // 请替换为您自己的网络歌单链接
        // 注意：这些链接必须支持 CORS，否则浏览器会阻止播放。
        // 如果您遇到 CORS 错误，请参考下面的“重要提示：关于 CORS”部分。
        tracks = [
            {
                name: "Skylike - Dawn",
                artist: "Skylike",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // 示例外部MP3链接
                cover: "https://faithbai.github.io/my-music/images/1.jpg" // 示例封面链接
            },
            {
                name: "Alex Skrindo - Me & You",
                artist: "Alex Skrindo",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                cover: "https://faithbai.github.io/my-music/images/2.jpg"
            },
            {
                name: "Kaibu - Electro Boy",
                artist: "Kaibu",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                cover: "https://faithbai.github.io/my-music/images/3.jpg"
            },
            {
                name: "Tobu & Syndec - Home",
                artist: "Tobu & Syndec",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                cover: "https://faithbai.github.io/my-music/images/4.jpg"
            },
            {
                name: "Alan Walker - Eclipse",
                artist: "Alan Walker",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
                cover: "https://faithbai.github.io/my-music/images/5.jpg"
            },
            {
                name: "Tobu - Paradise",
                artist: "Tobu",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
                cover: "https://faithbai.github.io/my-music/images/6.jpg"
            }
        ],
        // 移除原始的索引变量，直接使用 tracks 数组
        // a = 0,
        // currIndex = -1; // 初始化为 -1，以便第一次加载时能正确设置第一首歌

        // 确保 jQuery 和 Audio 对象已准备好
        // var audio = new Audio(); // 原始代码中没有声明，这里添加
        // audio.loop = false; // 原始代码中没有设置，这里添加

        currIndex = -1; // 初始化为 -1，以便第一次加载时能正确设置第一首歌
        var audio = new Audio();
        audio.loop = false;

    function playPause() {
        setTimeout(function() {
            if (audio.paused) {
                playerTrack.addClass('active');
                albumArt.addClass('active');
                checkBuffering();
                i.attr('class', 'fas fa-pause');
                audio.play();
            } else {
                playerTrack.removeClass('active');
                albumArt.removeClass('active');
                clearInterval(buffInterval);
                albumArt.removeClass('buffering');
                i.attr('class', 'fas fa-play');
                audio.pause();
            }
        }, 300);
    }


    function showHover(event) {
        seekBarPos = sArea.offset();
        seekT = event.clientX - seekBarPos.left;
        seekLoc = audio.duration * (seekT / sArea.outerWidth());

        sHover.width(seekT);

        cM = seekLoc / 60;

        ctMinutes = Math.floor(cM);
        ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if (ctMinutes < 10)
            ctMinutes = '0' + ctMinutes;
        if (ctSeconds < 10)
            ctSeconds = '0' + ctSeconds;

        if (isNaN(ctMinutes) || isNaN(ctSeconds))
            insTime.text('--:--');
        else
            insTime.text(ctMinutes + ':' + ctSeconds);

        insTime.css({
            'left': seekT,
            'margin-left': '-21px'
        }).fadeIn(0);

    }

    function hideHover() {
        sHover.width(0);
        insTime.text('00:00').css({
            'left': '0px',
            'margin-left': '0px'
        }).fadeOut(0);
    }

    function playFromClickedPos() {
        audio.currentTime = seekLoc;
        seekBar.width(seekT);
        hideHover();
    }

    function updateCurrTime() {
        nTime = new Date();
        nTime = nTime.getTime();

        if (!tFlag) {
            tFlag = true;
            trackTime.addClass('active');
        }

        curMinutes = Math.floor(audio.currentTime / 60);
        curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

        durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);

        playProgress = (audio.currentTime / audio.duration) * 100;

        if (curMinutes < 10)
            curMinutes = '0' + curMinutes;
        if (curSeconds < 10)
            curSeconds = '0' + curSeconds;

        if (durMinutes < 10)
            durMinutes = '0' + durMinutes;
        if (durSeconds < 10)
            durSeconds = '0' + durSeconds;

        if (isNaN(curMinutes) || isNaN(curSeconds))
            tProgress.text('00:00');
        else
            tProgress.text(curMinutes + ':' + curSeconds);

        if (isNaN(durMinutes) || isNaN(durSeconds))
            tTime.text('00:00');
        else
            tTime.text(durMinutes + ':' + durSeconds);

        seekBar.width(playProgress + '%');

        if (playProgress == 100) {
            i.attr('class', 'fa fa-play');
            seekBar.width(0);
            tProgress.text('00:00');
            albumArt.removeClass('buffering').removeClass('active');
            clearInterval(buffInterval);
            selectTrack(currIndex + 1); // 播放下一首
        }
    }

    function checkBuffering() {
        clearInterval(buffInterval);
        buffInterval = setInterval(function() {
            if (nTime == 0 || bTime - nTime > 1000) {
                albumArt.addClass('buffering');
            } else {
                albumArt.removeClass('buffering');
            }
            bTime = new Date();
            bTime = bTime.getTime();
        }, 100);
    }

    function selectTrack(flag) {
        if (flag == 0 || flag == 1) { // 0 for prev, 1 for next
            if (flag == 0)
                currIndex--;
            else
                currIndex++;

            if (currIndex > -1 && currIndex < tracks.length) {
                if (flag == 0) {
                    i.attr('class', 'fa fa-backward');
                } else {
                    i.attr('class', 'fa fa-forward');
                }
                audio.pause();
                seekBar.width(0);
                trackTime.removeClass('active');
                tProgress.text('00:00');
                tTime.text('00:00');
                currAlbum = tracks[currIndex].name; // 使用 tracks 数组
                currTrackName = tracks[currIndex].artist; // 使用 tracks 数组
                currArtwork = tracks[currIndex].cover; // 使用 tracks 数组

                audio.src = tracks[currIndex].url; // 关键：设置音频源为网络URL

                nTime = 0;
                bTime = new Date();
                bTime = bTime.getTime();

                if (flag != 0 || flag != 1) {
                    audio.pause();
                }

                albumName.text(currAlbum);
                trackName.text(currTrackName);
                albumArt.find('img.active').removeClass('active');
                $('#album-art img:eq(' + currIndex + ')').addClass('active'); // 确保图片索引正确
                bgArtwork.css({
                    'background-image': 'url(' + currArtwork + ')'
                });

                setTimeout(function() {
                    if (flag == 0 || flag == 1) {
                        audio.play();
                        playerTrack.addClass('active');
                        albumArt.addClass('active');
                        i.attr('class', 'fa fa-pause');
                    } else {
                        audio.pause();
                    }
                }, 300);
            } else {
                if (flag == 0) {
                    currIndex = tracks.length - 1; // 循环到最后一首
                } else {
                    currIndex = 0; // 循环到第一首
                }
                selectTrack(flag); // 再次调用以播放
            }
        } else { // Initial load or direct selection
            currIndex = 0; // 默认播放第一首
            currAlbum = tracks[currIndex].name;
            currTrackName = tracks[currIndex].artist;
            currArtwork = tracks[currIndex].cover;

            audio.src = tracks[currIndex].url;

            albumName.text(currAlbum);
            trackName.text(currTrackName);
            // 确保只有第一张专辑封面是 active
            $('#album-art img').removeClass('active');
            $('#album-art img:eq(' + currIndex + ')').addClass('active');
            bgArtwork.css({
                'background-image': 'url(' + currArtwork + ')'
            });
        }
    }

    function initPlayer() {
        selectTrack(null); // 初始化播放器，加载第一首歌
    }

    initPlayer();

    $('#play-pause-button').on('click', playPause);
    $('#prev-button').on('click', function() {
        selectTrack(0);
    });
    $('#next-button').on('click', function() {
        selectTrack(1);
    });

    sArea.mousemove(function(event) {
        showHover(event);
    });

    sArea.mouseout(function() {
        hideHover();
    });

    sArea.on('click', playFromClickedPos);

    $(audio).on('timeupdate', updateCurrTime);
});
