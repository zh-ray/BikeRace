// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('table tbody');
    if (!tableBody) {
        console.error('未找到比赛日历表格的 tbody 元素');
        return;
    }

    // 定义一个函数，用于根据赛事类型返回对应的图标
    function getRaceIcon(raceType) {
        if (raceType === '2') {
            return '🔄'; // 绕圈赛
        } else if (raceType === '3') {
            return '⛰️'; // 爬坡赛
        }
        return '🚴'; // 普通赛事（默认）
    }

    // 定义一个函数，用于添加比赛条目
    function addRace(shortName, fullName, location, date, distance, registrationStart, registrationEnd, webUrl, roadStatus, raceType) {
        const newRow = document.createElement('tr');

        // 设置交替行背景色
        const rowCount = tableBody.querySelectorAll('tr').length;
        if (rowCount % 2 === 1) {
            newRow.style.backgroundColor = '#f9f9f9';
        }

        // 创建每一列并填充数据
        const columns = [shortName, fullName, location, date];
        columns.forEach((colData) => {
            const td = document.createElement('td');
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px';
            td.textContent = colData;
            newRow.appendChild(td);
        });

        // 创建赛事里程列并添加封路状态和图标
        const distanceTd = document.createElement('td');
        distanceTd.style.border = '1px solid #ddd';
        distanceTd.style.padding = '8px';

        // 获取赛事类型图标
        const raceIcon = getRaceIcon(raceType);

        // 设置封路状态颜色
        let roadStatusText = '';
        let roadStatusColor = '';
        if (roadStatus === '1') {
            roadStatusText = '全封闭道路';
            roadStatusColor = '#f44336'; // 红色
        } else if (roadStatus === '2') {
            roadStatusText = '半封闭道路';
            roadStatusColor = '#FF9800'; // 橙色
        } else if (roadStatus === '3') {
            roadStatusText = '无封闭道路';
            roadStatusColor = '#4CAF50'; // 绿色
        }

        // 将图标、里程和封路状态组合到一起
        distanceTd.innerHTML = `${raceIcon} ${distance} <span style="color: ${roadStatusColor}; font-weight: bold;">(${roadStatusText})</span>`;
        newRow.appendChild(distanceTd);

        // 创建报名时间列
        const registrationTd = document.createElement('td');
        registrationTd.style.border = '1px solid #ddd';
        registrationTd.style.padding = '8px';
        registrationTd.textContent = registrationStart;
        newRow.appendChild(registrationTd);

        // 创建是否截至报名列
        const statusTd = document.createElement('td');
        statusTd.style.border = '1px solid #ddd';
        statusTd.style.padding = '8px';
        statusTd.style.textAlign = 'center';

        // 比较当前时间与报名结束时间
        const now = new Date();
        const endDate = new Date(registrationEnd);
        let isRegistrationOpen = false;

        if (now > endDate) {
            statusTd.textContent = '已截止';
            statusTd.style.color = '#f44336'; // 红色表示已截止
        } else {
            statusTd.textContent = '报名中';
            statusTd.style.color = '#4CAF50'; // 绿色表示报名中
            isRegistrationOpen = true; // 报名中状态

            // 如果报名中且有链接，添加“请点击”
            if (webUrl) {
                const link = document.createElement('a');
                link.href = webUrl;
                link.textContent = '（请点击）';
                link.target = '_blank'; // 在新标签页中打开链接
                link.style.color = '#007BFF'; // 设置链接颜色
                link.style.textDecoration = 'none'; // 去掉下划线
                statusTd.appendChild(link);
            }
        }

        newRow.appendChild(statusTd);

        // 将新行添加到表格中
        tableBody.appendChild(newRow);
    }

    // 定义一个函数，用于加载 CSV 文件
    function loadCSV(filePath) {
        fetch(filePath)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`无法加载文件: ${response.statusText}`);
                }
                return response.text();
            })
            .then((csvData) => {
                const rows = csvData.trim().split('\n'); // 按行分割
                const raceData = rows.slice(1).map((row) => { // 跳过第一行
                    const columns = row.split(','); // 按逗号分割列
                    if (columns.length >= 10) {
                        return {
                            shortName: columns[0].trim(),
                            fullName: columns[1].trim(),
                            location: columns[2].trim(),
                            date: columns[3].trim(),
                            distance: columns[4].trim(),
                            registrationStart: columns[5].trim(),
                            registrationEnd: columns[6].trim(),
                            webUrl: columns[7] ? columns[7].trim() : null,
                            roadStatus: columns[8] ? columns[8].trim() : '1',
                            raceType: columns[9] ? columns[9].trim() : '1' // 赛事类型，默认为 1
                        };
                    }
                    return null;
                }).filter((item) => item !== null); // 过滤掉无效数据

                // 排序规则：
                // 1. 报名中在前，已截止在后
                // 2. 同状态下按比赛日期从大到小排序
                // 3. 比赛日期相同时，按报名开始日期从大到小排序
                raceData.sort((a, b) => {
                    const now = new Date();
                    const aStatus = now > new Date(a.registrationEnd) ? 1 : 0; // 1 表示已截止，0 表示报名中
                    const bStatus = now > new Date(b.registrationEnd) ? 1 : 0;

                    if (aStatus !== bStatus) {
                        return aStatus - bStatus; // 报名中在前
                    }

                    // 同状态下按比赛日期从大到小排序
                    const dateComparison = new Date(b.date) - new Date(a.date);
                    if (dateComparison !== 0) {
                        return dateComparison;
                    }

                    // 比赛日期相同时，按报名开始日期从大到小排序
                    return new Date(b.registrationStart) - new Date(a.registrationStart);
                });

                // 添加排序后的比赛条目到表格
                raceData.forEach((race) => {
                    addRace(
                        race.shortName,
                        race.fullName,
                        race.location,
                        race.date,
                        race.distance,
                        race.registrationStart,
                        race.registrationEnd,
                        race.webUrl,
                        race.roadStatus,
                        race.raceType
                    );
                });
            })
            .catch((error) => {
                console.error('加载 CSV 文件时出错:', error);
            });
    }

    // 加载同目录下的 race.csv 文件
    loadCSV('./race.csv');
});