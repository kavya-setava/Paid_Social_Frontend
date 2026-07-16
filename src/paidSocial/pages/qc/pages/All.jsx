import React, { useState, useEffect } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import './All.css';

const All = () => {
    const [activeStatus, setActiveStatus] = useState('all');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Ready for API Integration
    const [counts, setCounts] = useState({
        all: 25,
        readyToQc: 4,
        inQc: 3,
        rejected: 1,
        trafficked: 3,
    });

    useEffect(() => {
        // Replace this simulation block with your real Axios/Fetch call:
        // axios.get(`/api/qc-tickets?status=${activeStatus}`).then(...)
        setLoading(true);
        const mockTimeout = setTimeout(() => {
            const mockData = [
                {
                    id: 1,
                    taskReceivedTime: '2024-01-15 10:30 AM',
                    marketingCampaign: 'Summer Sale 2024',
                    campaignName: 'Summer Campaign',
                    adSetName: 'US - 18-35 - Mobile',
                    adName: 'Summer Ad V1',
                    highVisibilityTitles: 'Yes',
                    adTech: 'Meta',
                    taskType: 'Creative Review',
                    page: 'Facebook',
                    platform: 'Meta Ads',
                    region: 'US',
                    adFlightStart: '2024-01-20 12:00 AM',
                    adFlightEnd: '2024-02-20 11:59 PM',
                    operator: 'John Doe',
                    taskAssignedTime: '2024-01-15 11:00 AM',
                    publishDate: '2024-01-20',
                    launchingPrioritization: 'High',
                    taskStatus: 'Ready to QC',
                    socialiteNotes: 'Need to review creative assets',
                    traffickerComments: 'Assets uploaded',
                    qcThread: 'Thread #123',
                    qcEr: 'Unassigned',
                    qcStatus: 'Ready to QC',
                    qcComments: 'Check brand guidelines',
                },
                {
                    id: 2,
                    taskReceivedTime: '2024-01-14 02:15 PM',
                    marketingCampaign: 'Winter Promo',
                    campaignName: 'Winter Campaign',
                    adSetName: 'EU - 25-45 - Desktop',
                    adName: 'Winter Ad V2',
                    highVisibilityTitles: 'No',
                    adTech: 'Google',
                    taskType: 'QA Review',
                    page: 'Google Ads',
                    platform: 'Google Ads',
                    region: 'EU',
                    adFlightStart: '2024-01-25 12:00 AM',
                    adFlightEnd: '2024-02-25 11:59 PM',
                    operator: 'Sarah Johnson',
                    taskAssignedTime: '2024-01-14 03:00 PM',
                    publishDate: '2024-01-25',
                    launchingPrioritization: 'Medium',
                    taskStatus: 'In QC',
                    socialiteNotes: 'Awaiting creative assets',
                    traffickerComments: 'In progress',
                    qcThread: 'Thread #124',
                    qcEr: 'Trupti',
                    qcStatus: 'In QC',
                    qcComments: 'Need revisions',
                },
                {
                    id: 3,
                    taskReceivedTime: '2024-01-13 09:00 AM',
                    marketingCampaign: 'Spring Launch',
                    campaignName: 'Spring Campaign',
                    adSetName: 'APAC - 20-40 - All Devices',
                    adName: 'Spring Ad V3',
                    highVisibilityTitles: 'Yes',
                    adTech: 'TikTok',
                    taskType: 'Creative Review',
                    page: 'TikTok',
                    platform: 'TikTok Ads',
                    region: 'APAC',
                    adFlightStart: '2024-02-01 12:00 AM',
                    adFlightEnd: '2024-03-01 11:59 PM',
                    operator: 'Mike Brown',
                    taskAssignedTime: '2024-01-13 10:00 AM',
                    publishDate: '2024-02-01',
                    launchingPrioritization: 'High',
                    taskStatus: 'Trafficked',
                    socialiteNotes: 'Approved',
                    traffickerComments: 'Live on platform',
                    qcThread: 'Thread #125',
                    qcEr: 'Divya',
                    qcStatus: 'Trafficked',
                    qcComments: 'All good',
                },
                {
                    id: 4,
                    taskReceivedTime: '2024-01-12 11:45 AM',
                    marketingCampaign: 'Holiday Special',
                    campaignName: 'Holiday Campaign',
                    adSetName: 'LATAM - 18-30 - Mobile',
                    adName: 'Holiday Ad V4',
                    highVisibilityTitles: 'No',
                    adTech: 'Meta',
                    taskType: 'QA Review',
                    page: 'Instagram',
                    platform: 'Meta Ads',
                    region: 'LATAM',
                    adFlightStart: '2024-01-15 12:00 AM',
                    adFlightEnd: '2024-02-15 11:59 PM',
                    operator: 'Lisa Wilson',
                    taskAssignedTime: '2024-01-12 01:00 PM',
                    publishDate: '2024-01-15',
                    launchingPrioritization: 'Low',
                    taskStatus: 'Rejected',
                    socialiteNotes: 'Review pending',
                    traffickerComments: 'Awaiting QC',
                    qcThread: 'Thread #126',
                    qcEr: 'Kavya',
                    qcStatus: 'Rejected',
                    qcComments: 'Brand guidelines not followed',
                },
            ];

            // Filter data based on active status
            let filteredData = mockData;
            if (activeStatus !== 'all') {
                const statusMap = {
                    readyToQc: 'Ready to QC',
                    inQc: 'In QC',
                    rejected: 'Rejected',
                    trafficked: 'Trafficked',
                };
                filteredData = mockData.filter(
                    (item) => item.taskStatus === statusMap[activeStatus]
                );
            }

            setTickets(filteredData);
            setLoading(false);
        }, 400);

        return () => clearTimeout(mockTimeout);
    }, [activeStatus]);

    return (
        <div className="all-page">
            <StatusCards
                counts={counts}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
                tabType="all"
            />
            <TicketsTable
                tickets={tickets}
                loading={loading}
                activeStatus={activeStatus}
            />
        </div>
    );
};

export default All;