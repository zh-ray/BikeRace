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
        '秋赛', // 赛事简称
        '秋季骑行赛', // 赛事全称
        '上海', // 赛事地点
        '2025年9月15日', // 赛事时间
        '60公里', // 赛事长度
        '2025年8月1日 - 2025年9月1日', // 报名时间
        '120元' // 报名费
    );
    addRace(
        '秋赛', // 赛事简称
        '秋季骑行赛', // 赛事全称
        '上海', // 赛事地点
        '2025年9月15日', // 赛事时间
        '60公里', // 赛事长度
        '2025年8月1日 - 2025年9月1日', // 报名时间
        '120元' // 报名费
    );
});