let $host = GM_info.scriptMetaStr.match(/@host\s+([^\n]+)/)?.[1]?.trim();
let $branch = GM_info.script.version.includes('newway') ? 'Free%20kinopoisk%20newway.user.js' : 'Free%20kinopoisk.user.js';

GM_xmlhttpRequest({
    method: "GET",
    url: `${$host}/config.json`,
    onload: function(response) {

        let $current_version = GM_info.script.version;
        let $last_version = JSON.parse(response.responseText).version.newway;

        function update_able($current_version, $last_version) {
            if (GM_info.script.version.includes('newway')) {
                if ($current_version.includes('/') && !$last_version.includes('/')) return 1;
            }

            let $v1 = $current_version.split(/[./-]/).map(Number).filter(s => !isNaN(s));
            let $v2 = $last_version.split(/[./-]/).map(Number).filter(s => !isNaN(s));

            if (JSON.stringify($v1) === JSON.stringify($v2)) return 0;

            let $n1,$n2;
            for (let i = 0; i < Math.max($v1.length, $v2.length); i++) {
                $n1 = $v1[i] || 0;
                $n2 = $v2[i] || 0;

                if ($n1 > $n2) {return 0} else if ($n1 < $n2) {break}
            }
            return 1;
        };

        if (update_able($current_version, $last_version) === 0) return;


        $('ui').prepend($('<update>', {style: 'display: none'}).append(
            $('<div>').append(
                $('<div>', {class: 'update_menu'}).append(
                    $('<h2>', {class: 'update_head', text: 'Доступно обновление'})
                ).append(
                    $('<div>', {class: 'update_info'}).append(
                        $('<span>', {text: $last_version, class: 'version_update'})
                    ).append(
                        $('<div>', {class: 'update_list'})
                    )
                ).append(
                    $('<div>', {class: 'update_buttons'}).append(
                        $('<span>', {class: 'update_later', text: 'Не сейчас'}).click(function() {$('update').remove(); $('section, info').css('pointer-events', '');})
                    ).append(
                        $('<button>', {class: 'update_now', text: 'Обновить'}).click(function() {
                            window.location.href = `https://github.com/ecXbe/Free-Kinopoisk/raw/main/${$branch}`;
                            setTimeout(function() {
                                $('.update_buttons, .version_update').remove();
                                $('.update_head').text('Вы обновились!');
                                $('.update_list').empty().append($('<p>', {class: 'innovation', text: 'Чтобы изменения вступили в силу, перезагрузите страницу'}));
                            }, 1000);
                        })
                    )
                )
            )
        ));

        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.github.com/repos/ecXbe/Free-Kinopoisk/commits?path=${$branch}`,
            onload: function(response) {
                let $commit_match = GM_info.script.version.includes('newway') ? 'v2077v(\\.\\d+)+[^; ]*' : 'v2077v(\\.\\d+)+';

                let $current_version = GM_info.script.version;
                let $versions = JSON.parse(response.responseText).map(s => {
                    let $commits = s.commit.message.split('\n\n')[0].match($commit_match);
                    return $commits ? $commits[0] : null;
                }).filter(Boolean);
                for (let i in $versions) {
                    if (update_able($current_version, $versions[i]) === 0) {
                        if (i == 1) {$('span.version_highlighting').remove();}
                        break;
                    } else if ($versions[i] !== $versions[i-1]) {
                        $('.update_list').append($('<span>', {class: 'version_highlighting', text: $versions[i]}));
                        let $lastCommit = JSON.parse(response.responseText)[i].commit.message;
                        let $lines = $lastCommit.split('\n\n').slice(1).join('\n').split(/\r?\n/);

                        for (let i = 0; i < $lines.length; i++) {
                            if ($lines[i] === '--RU--') {
                                $('.update_list').append($('<span>', {class: 'highlighting'}));
                            } else {
                                $('.update_list').append($('<p>', {text: $lines[i], class: 'innovation'}))
                            }
                        }
                    }
                }

                $('update').css('display', '');
                $('section, info').css('pointer-events', 'none');
            }
        });
    }
});