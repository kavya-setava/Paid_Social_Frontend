import React, { useState, useEffect } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import './MyDashboard.css';

const MyDashboard = () => {
    const [activeStatus, setActiveStatus] = useState('readyToQc');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timers, setTimers] = useState({});

    // Ready for API Integration
    const [counts, setCounts] = useState({
        readyToQc: 4,
        inQc: 3,
        rejected: 1,
        trafficked: 3,
    });

    // Timer logic
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers((prevTimers) => {
                const updatedTimers = { ...prevTimers };
                Object.keys(updatedTimers).forEach((key) => {
                    if (updatedTimers[key].isRunning) {
                        updatedTimers[key].seconds += 1;
                    }
                });
                return updatedTimers;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Start timer when ticket moves to In QC
    const startTimer = (ticketId) => {
        setTimers((prev) => ({
            ...prev,
            [ticketId]: { seconds: 0, isRunning: true },
        }));
    };

    // Pause timer
    const pauseTimer = (ticketId) => {
        setTimers((prev) => ({
            ...prev,
            [ticketId]: { ...prev[ticketId], isRunning: false },
        }));
    };

    // Resume timer
    const resumeTimer = (ticketId) => {
        setTimers((prev) => ({
            ...prev,
            [ticketId]: { ...prev[ticketId], isRunning: true },
        }));
    };

    // Format time from seconds to HH:MM:SS
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Handle Task Status change
    const handleTaskStatusChange = (ticketId, newStatus, currentStatus) => {
        // Update ticket status
        setTickets((prevTickets) =>
            prevTickets.map((ticket) =>
                ticket.id === ticketId
                    ? { ...ticket, taskStatus: newStatus }
                    : ticket
            )
        );

        // If moving to In QC, start timer
        if (newStatus === 'In QC') {
            startTimer(ticketId);
        }

        // If moving out of In QC, stop timer
        if (currentStatus === 'In QC' && newStatus !== 'In QC') {
            setTimers((prev) => ({
                ...prev,
                [ticketId]: { ...prev[ticketId], isRunning: false },
            }));
        }

        // Update counts based on status change
        setCounts((prev) => ({
            ...prev,
            [currentStatus.toLowerCase().replace(' ', '')]: prev[currentStatus.toLowerCase().replace(' ', '')] - 1,
            [newStatus.toLowerCase().replace(' ', '')]: (prev[newStatus.toLowerCase().replace(' ', '')] || 0) + 1,
        }));
    };

    // Handle QC Comments change
    const handleQcCommentsChange = (ticketId, value) => {
        setTickets((prevTickets) =>
            prevTickets.map((ticket) =>
                ticket.id === ticketId
                    ? { ...ticket, qcComments: value }
                    : ticket
            )
        );
    };

    useEffect(() => {
        // Replace this simulation block with your real Axios/Fetch call:
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
                    qcEr: 'Trupti',
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
                    qcEr: 'Divya',
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
                    qcEr: 'Kavya',
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
                    qcEr: 'Harika',
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
        <div className="my-dashboard-page">
            <StatusCards
                counts={counts}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
                tabType="myDashboard"
            />
            <TicketsTable
                tickets={tickets}
                loading={loading}
                activeStatus={activeStatus}
                timers={timers}
                onPauseTimer={pauseTimer}
                onResumeTimer={resumeTimer}
                onTaskStatusChange={handleTaskStatusChange}
                onQcCommentsChange={handleQcCommentsChange}
                isMyDashboard={true}
            />
        </div>
    );
};

export default MyDashboard;