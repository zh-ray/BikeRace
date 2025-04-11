// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // console.log('addRace.js 已加载');

    // 获取表格的 tbody 元素
    const tableBody = document.querySelector('table tbody');
    if (!tableBody) {
        console.error('未找到比赛日历表格的 tbody 元素');
        return;
    }

    // 定义一个函数，用于添加比赛条目
    function addRace(shortName, fullName, location, date, distance, registrationPeriod, fee) {
        // 创建一个新的表格行
        const newRow = document.createElement('tr');

        // 设置交替行背景色
        const rowCount = tableBody.querySelectorAll('tr').length;
        if (rowCount % 2 === 1) {
            newRow.style.backgroundColor = '#f9f9f9';
        }

        // 创建每一列并填充数据
        const columns = [shortName, fullName, location, date, distance, registrationPeriod, fee];
        columns.forEach((colData) => {
            const td = document.createElement('td');
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px';
            td.textContent = colData;
            newRow.appendChild(td);
        });

        // 将新行添加到表格中
        tableBody.appendChild(newRow);
    }

    // 示例：添加一个新的比赛条目
    addRace(
        'HEROS·黄岩站', // 赛事简称
        '中国自行车运动骑游大会（湖系列）永宁悦动•2025环长潭湖自行车赛暨HEROS自行车系列赛鸿鲸枫度—黄岩站', // 赛事全称
        '中国·台州', // 赛事地点
        '2025.05.18', // 赛事时间
        '97km', // 赛事长度
        '2025.04.07 10:00', // 报名时间
        '198CNY' // 报名费
    );
    addRace(
        'HEROS·千岛湖站', // 赛事简称
        '中国自行车运动骑游大会（湖系列）第十九届中国环千岛湖公路自行车赛2025环浙步道自行车系列赛（总决赛）', // 赛事全称
        '中国·淳安', // 赛事地点
        '2025.11.09', // 赛事时间
        '136km', // 赛事长度
        '2025.04.12 10:00', // 报名时间
        '298CNY' // 报名费
    );
});