// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    const table = document.querySelector('table');
    const tableBody = table.querySelector('tbody');
    const cardContainer = document.querySelector('.card-container');
    const toggleButton = document.getElementById('toggleViewButton');
    let raceData = [];  // 用于存储比赛数据

    if (!tableBody || !cardContainer) {
        console.error('未找到表格或卡片容器元素');
        return;
    }

    // 根据屏幕宽度设置默认视图
    function setDefaultView() {
        if (window.innerWidth < 1035) {
            // 小于 1035px，显示卡片视图
            table.style.display = 'none';
            cardContainer.style.display = 'flex';
            toggleButton.textContent = '切换到表格视图';
            renderCards(raceData); // 渲染卡片
        } else {
            // 大于等于 1035px，显示表格视图
            table.style.display = 'table';
            cardContainer.style.display = 'none';
            toggleButton.textContent = '切换到卡片视图';
            renderTable(raceData); // 渲染表格
        }
    }

    // 切换视图逻辑
    toggleButton.addEventListener('click', () => {
        if (table.style.display === 'none') {
            // 显示表格，隐藏卡片
            table.style.display = 'table';
            cardContainer.style.display = 'none';
            toggleButton.textContent = '切换到卡片视图';
            renderTable(raceData); // 渲染表格
        } else {
            // 显示卡片，隐藏表格
            table.style.display = 'none';
            cardContainer.style.display = 'flex';
            toggleButton.textContent = '切换到表格视图';
            renderCards(raceData); // 渲染卡片
        }
    });

    // 监听窗口大小变化，动态调整默认视图
    window.addEventListener('resize', setDefaultView);

    // 定义一个函数，用于根据赛事类型返回对应的图标
    function getRaceIcon(raceType) {
        if (raceType === '2') {
            return '🔄'; // 绕圈赛
        } else if (raceType === '3') {
            return '⛰️'; // 爬坡赛
        }
        return '🚴'; // 普通赛事（默认）
    }

    function getRoadStatusStyle(roadStatus) {
        let roadStatusText = '全封闭道路';
        let roadStatusColor = '#f44336';

        if (roadStatus === '2') {
            roadStatusText = '半封闭道路';
            roadStatusColor = '#FF9800'; // 橙色
        } else if (roadStatus === '3') {
            roadStatusText = '无封闭道路';
            roadStatusColor = '#4CAF50'; // 绿色
        }

        return { text: roadStatusText, color: roadStatusColor };
    }

    function getRegistrationStatus(registrationStart, registrationEnd, webUrl) {
        const now = new Date();
        const startDate = registrationStart !== '-' && registrationStart !== 'cancel' ? new Date(registrationStart) : null;
        const endDate = registrationEnd !== '-' && registrationEnd !== 'cancel' ? new Date(registrationEnd) : null;

        const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 小时的毫秒数

        if (registrationStart === 'cancel' || registrationEnd === 'cancel') {
            // 如果报名时间为 'cancel'，显示已取消
            return { text: '已取消', color: '#9E9E9E', link: null }; // 灰色表示已取消
        } else if (registrationStart === '-' || registrationEnd === '-') {
            // 如果报名时间为 '-'，显示待报名
            return { text: '待报名', color: '#FF9800', link: webUrl !== '/' ? webUrl : null };
        } else if (now < startDate) {
            // 报名时间未到
            const timeToStart = startDate - now;
            const statusText = timeToStart <= sixHoursInMs ? '即将开始' : '待报名';
            const statusColor = timeToStart <= sixHoursInMs ? '#0AEE12' : '#FF9800'; // 红橙色提醒
            return { text: statusText, color: statusColor, link: webUrl !== '/' ? webUrl : null };
        } else if (now > endDate) {
            // 报名已截止
            return { text: '已截止', color: '#9E9E9E', link: null };
        } else {
            // 报名中
            const timeToEnd = endDate - now;
            const statusText = timeToEnd <= sixHoursInMs ? '即将结束' : '正在报名';
            statusColor = timeToEnd <= sixHoursInMs ? '#FF4500' : '#4CAF50'; // 红橙色提醒
            return { text: statusText, color: statusColor, link: webUrl };
        }
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
        const { text: roadStatusText, color: roadStatusColor } = getRoadStatusStyle(roadStatus);

        // 将图标、里程和封路状态组合到一起
        distanceTd.innerHTML = `${raceIcon} ${distance} <span style="color: ${roadStatusColor}; font-weight: bold;">(${roadStatusText})</span>`;
        newRow.appendChild(distanceTd);

        // 创建报名时间列
        const registrationTd = document.createElement('td');
        registrationTd.style.border = '1px solid #ddd';
        registrationTd.style.padding = '8px';
        registrationTd.textContent = registrationStart;
        newRow.appendChild(registrationTd);

        // 创建是否截止报名列
        const statusTd = document.createElement('td');
        statusTd.style.border = '1px solid #ddd';
        statusTd.style.padding = '8px';
        statusTd.style.textAlign = 'center';

        // 获取报名状态
        const { text: statusText, color: statusColor, link } = getRegistrationStatus(registrationStart, registrationEnd, webUrl);

        // 设置状态文本和颜色
        statusTd.textContent = statusText;
        statusTd.style.color = statusColor;

        // 如果有链接且状态为报名中，添加链接
        if (link) {
            const anchor = document.createElement('a');
            anchor.href = link;
            anchor.textContent = '（请点击）';
            anchor.target = '_blank'; // 在新标签页中打开链接
            anchor.style.color = '#007BFF'; // 设置链接颜色
            anchor.style.textDecoration = 'none'; // 去掉下划线
            statusTd.appendChild(anchor);
        }

        newRow.appendChild(statusTd);

        // 将新行添加到表格中
        tableBody.appendChild(newRow);
    }

    // 定义一个函数，用于加载 CSV 文件
    function loadCSV(filePath) {
        return fetch(filePath).then((response) => {
            if (!response.ok) {
                throw new Error(`无法加载文件: ${response.statusText}`);
            }
            return response.text();
        }).then((csvData) => {
            const rows = csvData.trim().split('\n'); // 按行分割
            const headers = rows[0].split(',').map((header) => header.trim()); // 获取标题行并去除多余空格

            // 跳过第二行（注释行），从第三行开始解析数据
            const dataRows = rows.slice(2);

            // 将每一行数据映射为对象
            raceData = dataRows.map((row) => {
                const columns = row.split(',').map((col) => col.trim()); // 按逗号分割列并去除多余空格
                if (columns.length !== headers.length) {
                    console.warn('数据列数与标题列数不匹配，跳过该行:', row);
                    return null;
                }

                // 将列数据映射为对象
                const race = {};
                headers.forEach((header, index) => {
                    race[header] = columns[index];
                });

                return race;
            }).filter((item) => {
                if (!item) return false;

                // 过滤掉比赛日期已过的比赛
                const now = new Date();
                const raceDate = new Date(item.date.replace(/\./g, '-')); // 将 "YYYY.MM.DD" 转换为 "YYYY-MM-DD";
                return raceDate >= now;
            }); // 过滤掉无效数据和过期比赛

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

            // 设置默认视图
            setDefaultView();
        }).catch((error) => {
            console.error('加载 CSV 文件时出错:', error);
        });
    }

    let currentPage = 1; // 当前页码
    const rowsPerPage = 20; // 每页显示的行数

    // 定义一个函数，用于渲染表格
    function renderTable(raceData) {
        tableBody.innerHTML = ''; // 清空表格内容

        // 计算分页数据
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const pageData = raceData.slice(startIndex, endIndex);

        pageData.forEach((race) => {
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

        // 渲染分页控件
        renderPagination(raceData.length, rowsPerPage);
    }

    // 定义一个函数，用于渲染卡片
    function renderCards(raceData) {
        cardContainer.innerHTML = ''; // 清空卡片内容

        // 计算分页数据
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const pageData = raceData.slice(startIndex, endIndex);

        pageData.forEach((race) => {
            const card = document.createElement('div');
            card.className = 'card';

            // 获取赛事类型图标
            const raceIcon = getRaceIcon(race.raceType);

            // 获取封路状态文本和颜色
            const { text: roadStatusText, color: roadStatusColor } = getRoadStatusStyle(race.roadStatus);// 获取报名状态
            const { text: statusText, color: statusColor, link } = getRegistrationStatus(race.registrationStart, race.registrationEnd, race.webUrl);

            card.innerHTML = `
                <h4>${race.shortName}</h4>
                <p><strong>赛事名称:</strong> ${race.fullName}</p>
                <p><strong>赛事地点:</strong> ${race.location}</p>
                <p><strong>赛事时间:</strong> ${race.date}</p>
                <p><strong>赛事里程:</strong> ${raceIcon} ${race.distance} <span style="color: ${roadStatusColor}; font-weight: bold;">(${roadStatusText})</span></p>
                <p><strong>报名时间:</strong> ${race.registrationStart}</p>
                <p><span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
            `;

            // 如果有链接且状态为报名中，添加链接
            if (link) {
                const anchor = document.createElement('a');
                anchor.href = link;
                anchor.textContent = '（请点击）';
                anchor.target = '_blank'; // 在新标签页中打开链接
                anchor.style.color = '#007BFF'; // 设置链接颜色
                anchor.style.textDecoration = 'none'; // 去掉下划线

                // 将链接追加到状态段落中
                const statusParagraph = card.querySelector('p:last-child');
                statusParagraph.appendChild(anchor);
            }
            cardContainer.appendChild(card);
        });

        // 渲染分页控件
        renderPagination(raceData.length, rowsPerPage);
    }

    function renderPagination(totalRows, itemsPerPage) {
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = ''; // 清空分页内容

        const totalPages = Math.ceil(totalRows / itemsPerPage); // 总页数
        const maxVisiblePages = 5; // 最大显示的页码数量
        const halfVisible = Math.floor(maxVisiblePages / 2);

        // 添加“上一页”按钮
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '上一页';
            prevButton.style.margin = '0 5px';
            prevButton.style.padding = '5px 10px';
            prevButton.style.border = '1px solid #ddd';
            prevButton.style.cursor = 'pointer';
            prevButton.addEventListener('click', () => {
                currentPage--;
                updateView();
            });
            paginationContainer.appendChild(prevButton);
        }

        // 计算页码范围
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, currentPage + halfVisible);

        // 如果页码不足最大显示数量，调整范围
        if (currentPage <= halfVisible) {
            endPage = Math.min(totalPages, maxVisiblePages);
        } else if (currentPage + halfVisible > totalPages) {
            startPage = Math.max(1, totalPages - maxVisiblePages + 1);
        }

        // 添加页码按钮
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.style.margin = '0 5px';
            pageButton.style.padding = '5px 10px';
            pageButton.style.border = '1px solid #ddd';
            pageButton.style.backgroundColor = i === currentPage ? '#007BFF' : '#fff';
            pageButton.style.color = i === currentPage ? '#fff' : '#000';
            pageButton.style.cursor = 'pointer';

            // 添加点击事件
            pageButton.addEventListener('click', () => {
                currentPage = i;
                updateView();
            });

            paginationContainer.appendChild(pageButton);
        }

        // 添加“下一页”按钮
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '下一页';
            nextButton.style.margin = '0 5px';
            nextButton.style.padding = '5px 10px';
            nextButton.style.border = '1px solid #ddd';
            nextButton.style.cursor = 'pointer';
            nextButton.addEventListener('click', () => {
                currentPage++;
                updateView();
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    // 更新视图（表格或卡片）
    function updateView() {
        if (table.style.display === 'none') {
            renderCards(raceData); // 渲染卡片
        } else {
            renderTable(raceData); // 渲染表格
        }
    }

    // 动态生成表格内容
    loadCSV('./race.csv');
});