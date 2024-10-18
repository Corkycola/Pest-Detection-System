import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, ComposedChart, XAxis, YAxis, CartesianGrid, Bar, Line, Rectangle } from 'recharts';

const VisualizationPanel = ({
    detections = [],
    graphType = 'pie',
    xAxisType = 'day',
    showStackedBar = false,
    showBarChart = true,
    showLine = true,
    showCropArea = false,
    showPest = false,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2; // Two pie charts per page

    const aggregateDataForPieChart = () => {
        const dataMap = detections.reduce((acc, detection) => {
            acc[detection.className] = (acc[detection.className] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    };

    const aggregateDataForTimeSeries = () => {
        const dataMap = detections.reduce((acc, detection) => {
            const date = new Date(detection.timestamp);
            let key;
            switch (xAxisType) {
                case 'day':
                    key = date.toLocaleDateString();
                    break;
                case 'month':
                    key = `${date.getMonth() + 1}-${date.getFullYear()}`;
                    break;
                default:
                    key = date.toLocaleDateString();
            }
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    };

    const aggregateDataForPieChartByArea = () => {
        const areaMap = detections.reduce((acc, detection) => {
            if (!acc[detection.cropArea]) {
                acc[detection.cropArea] = {};
            }
            acc[detection.cropArea][detection.className] = (acc[detection.cropArea][detection.className] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(areaMap).map(([cropArea, data]) => ({
            cropArea,
            data: Object.entries(data).map(([name, value]) => ({ name, value })),
        }));
    };

    const aggregateDataForTimeSeriesByArea = () => {
        const dataMap = detections.reduce((acc, detection) => {
            const date = new Date(detection.timestamp);
            let key;
            switch (xAxisType) {
                case 'day':
                    key = date.toLocaleDateString();
                    break;
                case 'month':
                    key = `${date.getMonth() + 1}-${date.getFullYear()}`;
                    break;
                default:
                    key = date.toLocaleDateString();
            }
            if (!acc[key]) {
                acc[key] = { total: 0 };
            }
            if (!acc[key][detection.cropArea]) {
                acc[key][detection.cropArea] = 0;
            }
            acc[key][detection.cropArea] += 1;
            acc[key].total += 1;
            return acc;
        }, {});

        return Object.entries(dataMap).map(([date, cropAreas]) => ({
            date,
            ...cropAreas,
        }));
    };

    const aggregatePestData = () => {
        const dataMap = detections.reduce((acc, detection) => {
            const date = new Date(detection.timestamp);
            let key;
            switch (xAxisType) {
                case 'day':
                    key = date.toLocaleDateString();
                    break;
                case 'month':
                    key = `${date.getMonth() + 1}-${date.getFullYear()}`;
                    break;
                default:
                    key = date.toLocaleDateString();
            }
            if (!acc[key]) {
                acc[key] = { total: 0 };
            }
            if (!acc[key][detection.className]) {
                acc[key][detection.className] = 0;
            }
            acc[key][detection.className] += 1;
            acc[key].total += 1;
            return acc;
        }, {});

        return Object.entries(dataMap).map(([date, pestData]) => ({
            date,
            ...pestData,
        }));
    };

    const pieChartData = aggregateDataForPieChart();
    const timeSeriesData = aggregateDataForTimeSeries();
    const pieChartDataByArea = aggregateDataForPieChartByArea();
    const timeSeriesDataByArea = aggregateDataForTimeSeriesByArea();
    const pestData = aggregatePestData();
    const pestKeys = [...new Set(detections.map(d => d.className))];
    const cropAreaKeys = [...new Set(detections.map(d => d.cropArea))];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8A2BE2', '#A52A2A', '#DEB887', '#5F9EA0', '#7FFF00', '#D2691E', '#FF7F50', '#6495ED', '#FFF8DC', '#DC143C', '#00FFFF', '#00008B', '#008B8B', '#B8860B', '#A9A9A9', '#006400', '#BDB76B'];

    const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
        const radius = outerRadius * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const renderCustomizedLabelLine = (props) => {
        const { cx, cy, midAngle, outerRadius, index } = props;
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#ccc" fill="none" />
                <circle cx={ex} cy={ey} r={2} fill="#ccc" stroke="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" style={{ fontSize: '15px', maxWidth: '100px', whiteSpace: 'pre-wrap' }}>
                    {pieChartData[index].name}
                </text>
            </g>
        );
    };

    const renderBackground = (props) => {
        const { x, y, width, height, fill } = props;
        return <Rectangle x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.3} />;
    };

    // Pagination logic for pie charts by area
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPieCharts = pieChartDataByArea.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPagination = () => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(pieChartDataByArea.length / itemsPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <nav className="pagination">
                {pageNumbers.map(number => (
                    <span key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                        <button onClick={() => paginate(number)} className="page-link">
                            {number}
                        </button>
                    </span>
                ))}
            </nav>
        );
    };

    return (
        <div className="visualization-panel" style={{ height: '100%' }}>
            {graphType === 'pie' && !showCropArea ? (
                <ResponsiveContainer width="100%" height={500}>
                    <PieChart>
                        <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={200}
                            fill="#8884d8"
                            label={renderCustomizedLabel}
                            labelLine={renderCustomizedLabelLine}
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            ) : graphType === 'pie' && showCropArea ? (
                <>
                    <div className="pie-charts-by-area" style={{ height: '90%' }}>
                        {currentPieCharts.map((areaData, index) => (
                            <div key={index} className="pie-chart-container">
                                <h3>{areaData.cropArea}</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={areaData.data}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={150}
                                            fill="#8884d8"
                                            label={renderCustomizedLabel}
                                            labelLine={renderCustomizedLabelLine}
                                        >
                                            {areaData.data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </div>
                    {pieChartDataByArea.length > itemsPerPage && (
                        <div className="pagination-container">
                            {renderPagination()}
                        </div>
                    )}
                </>
            ) : (
                <ResponsiveContainer width="100%" height={500}>
                    <ComposedChart data={showPest ? pestData : (showCropArea ? timeSeriesDataByArea : timeSeriesData)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" label={{ value: 'Time', position: 'insideBottomRight', offset: 0, fill: '#333' }} />
                        <YAxis label={{ value: showCropArea ? 'Total Pests by Crop Area' : 'Total Pests Found', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        {showBarChart && (showCropArea || showPest) && (showCropArea ? cropAreaKeys : pestKeys).map(key => (
                            <Bar key={key} dataKey={key} fill={COLORS[(showCropArea ? cropAreaKeys : pestKeys).indexOf(key) % COLORS.length]} background={renderBackground} />
                        ))}
                        {showStackedBar && (showCropArea || showPest) && (showCropArea ? cropAreaKeys : pestKeys).map(key => (
                            <Bar key={key} dataKey={key} stackId="a" fill={COLORS[(showCropArea ? cropAreaKeys : pestKeys).indexOf(key) % COLORS.length]} />
                        ))}
                        {showLine && <Line type="monotone" dataKey="total" stroke="#ff7300" />}
                    </ComposedChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default VisualizationPanel;
