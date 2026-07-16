import React, { useState, useEffect } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import './Tickets.css';

const Tickets = () => {
    const [activeStatus, setActiveStatus] = useState('all');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Ready for API Integration
    const [counts, setCounts] = useState({
        all: 25,
        rttUnassigned: 4,
        rttAssigned: 3,
        inProgress: 5,
        onHold: 2,
        readyToQc: 4,
        inQc: 3,
        rejected: 1,
        trafficked: 3,
    });

    // Handler to update the ticket's operator status in state when selected
    const handleOperatorChange = (ticketId, selectedOperator) => {
        setTickets(prevTickets =>
            prevTickets.map(ticket =>
                ticket.id === ticketId
                    ? { ...ticket, operator: selectedOperator }
                    : ticket
            )
        );
    };

    // Centralized mock data mapping status keys to their designated table rows
    const MOCK_DATA_BY_STATUS = {
        all: [
            { id: 'T-101', taskReceivedTime: '2026-07-15 10:00', marketingCampaign: 'Summer Sale', campaignName: 'US_Summer_2026', adSetName: 'AdSet_Athletics', adName: 'Ad_Runner_01', highVisibilityTitles: 'Yes', adTech: 'Meta Ads', taskType: 'New Launch', page: 'Landing Page 1', platform: 'Facebook', region: 'NA', adFlightStart: '2026-07-20', adFlightEnd: '2026-08-20', operator: 'Jane Doe', operatorStatus: 'Completed', taskAssignedTime: '2026-07-15 10:15', publishDate: '2026-07-16', launchingPrioritization: 'High', taskStatus: 'Trafficked', statusClass: 'trafficked', socialiteNotes: 'Prioritize mobile layout', traffickerComments: 'Live across all states', qcThread: 'QC-983', qcer: 'Alex Smith', qcStatus: 'Approved', qcComments: 'Looks clean' },
            { id: 'T-102', taskReceivedTime: '2026-07-15 11:30', marketingCampaign: 'Brand Refresh', campaignName: 'EU_Refresh_V2', adSetName: 'AdSet_Casual', adName: 'Ad_Style_02', highVisibilityTitles: 'No', adTech: 'Google DV360', taskType: 'Optimization', page: 'Home Banner', platform: 'Display', region: 'EU', adFlightStart: '2026-07-22', adFlightEnd: '2026-09-01', operator: 'John Smith', operatorStatus: 'Active', taskAssignedTime: '2026-07-15 11:45', publishDate: '2026-07-17', launchingPrioritization: 'Medium', taskStatus: 'In Progress', statusClass: 'progress', socialiteNotes: 'Ensure localization copy', traffickerComments: '-', qcThread: 'QC-984', qcer: '-', qcStatus: 'Pending', qcComments: '-' }
        ],
        rttUnassigned: [
            { id: 'T-201', taskReceivedTime: '2026-07-15 08:00', marketingCampaign: 'Flash Deal', campaignName: 'APAC_Flash_50', adSetName: 'AdSet_Tech', adName: 'Ad_Promo_01', highVisibilityTitles: 'Yes', adTech: 'TikTok Ads', taskType: 'Urgent Creative Change', page: 'Promo Page', platform: 'TikTok', region: 'APAC', adFlightStart: '2026-07-16', adFlightEnd: '2026-07-18', operator: '-', taskAssignedTime: '-', publishDate: '2026-07-16', launchingPrioritization: 'Critical', statusClass: 'unassigned', socialiteNotes: 'Needs instant turnaround', traffickerComments: 'Waiting for available operator', qcThread: 'QC-110' }
        ],
        rttAssigned: [
            { id: 'T-301', taskReceivedTime: '2026-07-15 09:15', marketingCampaign: 'B2B Winter', campaignName: 'US_SaaS_LeadGen', adSetName: 'AdSet_Enterprise', adName: 'Ad_Whitepaper', highVisibilityTitles: 'No', adTech: 'LinkedIn Ads', taskType: 'Asset Update', page: 'Resources', platform: 'LinkedIn', region: 'NA', adFlightStart: '2026-08-01', adFlightEnd: '2026-12-31', operator: 'Sarah Jenkins', taskAssignedTime: '2026-07-15 12:00', publishDate: '2026-07-25', launchingPrioritization: 'Low', taskStatus: 'In Progress', socialiteNotes: 'Standard queue', qcThread: 'QC-112' }
        ],
        inProgress: [
            { id: 'T-401', taskReceivedTime: '2026-07-15 13:00', marketingCampaign: 'Product Drop', campaignName: 'Global_Drop_Sneakers', adSetName: 'AdSet_GenZ', adName: 'Ad_Video_01', highVisibilityTitles: 'Yes', adTech: 'Snapchat', taskType: 'Video Build', page: 'App Store Link', platform: 'Snapchat', region: 'Global', adFlightStart: '2026-07-19', adFlightEnd: '2026-07-26', operator: 'Jane Doe', operatorStatus: 'In Flight', taskAssignedTime: '2026-07-15 13:10', publishDate: '2026-07-18', launchingPrioritization: 'High', taskStatus: 'In Progress', statusClass: 'progress', socialiteNotes: 'Audio track sync is crucial', qcThread: 'QC-123' }
        ],
        onHold: [
            { id: 'T-501', taskReceivedTime: '2026-07-14 16:45', marketingCampaign: 'Influencer Tie-up', campaignName: 'US_Influencer_June', adSetName: 'AdSet_Lifestyle', adName: 'Ad_Collab_05', highVisibilityTitles: 'Yes', adTech: 'Meta Ads', taskType: 'Creative Swap', page: 'Shop All', platform: 'Instagram', region: 'NA', adFlightStart: '2026-07-20', adFlightEnd: '2026-08-20', operator: 'John Smith', operatorStatus: 'Paused', taskAssignedTime: '2026-07-14 17:00', publishDate: '2026-07-18', launchingPrioritization: 'Medium', taskStatus: 'On Hold', socialiteNotes: 'Awaiting creative assets from legal team', operatorComments: 'Legal approval pending on background audio rights', qcThread: 'QC-099' }
        ],
        readyToQc: [
            { id: 'T-601', taskReceivedTime: '2026-07-15 11:00', marketingCampaign: 'App Install Push', campaignName: 'LATAM_App_Install', adSetName: 'AdSet_Android', adName: 'Ad_Core_Features', highVisibilityTitles: 'No', adTech: 'Google UAC', taskType: 'Asset Upload', page: 'Play Store', platform: 'Google', region: 'LATAM', adFlightStart: '2026-07-25', adFlightEnd: '2026-09-25', operator: 'Sarah Jenkins', taskAssignedTime: '2026-07-15 11:15', publishDate: '2026-07-16', launchingPrioritization: 'High', taskStatus: 'Ready to QC', statusClass: 'ready', socialiteNotes: 'Double check deep-links', traffickerComments: 'Assets fully built out and mapped', qcThread: 'QC-502', qcer: 'Alex Smith' }
        ],
        inQc: [
            { id: 'T-701', taskReceivedTime: '2026-07-15 10:30', marketingCampaign: 'Clearance Event', campaignName: 'CA_Clearance_26', adSetName: 'AdSet_SmartShoppers', adName: 'Ad_Carousels', highVisibilityTitles: 'No', adTech: 'Meta Ads', taskType: 'New Creative', page: 'Clearance Hub', platform: 'Facebook', region: 'CA', adFlightStart: '2026-07-18', adFlightEnd: '2026-07-31', operator: 'John Smith', taskAssignedTime: '2026-07-15 10:45', publishDate: '2026-07-16', launchingPrioritization: 'High', taskStatus: 'In QC', statusClass: 'review', socialiteNotes: 'Pricing parameters must be exact', traffickerComments: 'Sent to senior QCer', qcThread: 'QC-771', qcer: 'Alex Smith' }
        ],
        rejected: [
            { id: 'T-801', taskReceivedTime: '2026-07-14 09:00', marketingCampaign: 'Back to School', campaignName: 'US_BTS_College', adSetName: 'AdSet_Dorms', adName: 'Ad_Video_Draft1', highVisibilityTitles: 'Yes', adTech: 'Meta Ads', taskType: 'Video Build', page: 'Dorm Collection', platform: 'Instagram', region: 'NA', adFlightStart: '2026-07-20', adFlightEnd: '2026-09-10', operator: 'Jane Doe', taskAssignedTime: '2026-07-14 09:30', publishDate: '2026-07-15', launchingPrioritization: 'High',taskStatus: 'Rejected', socialiteNotes: 'High visibility banner placement', traffickerComments: 'Ready for re-work', qcThread: 'QC-404', qcer: 'Alex Smith', qcStatus: 'Rejected', qcComments: 'Typo detected in main caption title: "Scholl" instead of "School". Please correct and resubmit.' }
        ],
        trafficked: [
            { id: 'T-901', taskReceivedTime: '2026-07-13 14:00', marketingCampaign: 'Subscription Push', campaignName: 'UK_Subs_Premium', adSetName: 'AdSet_Lookalike', adName: 'Ad_Static_V1', highVisibilityTitles: 'No', adTech: 'Meta Ads', taskType: 'New Launch', page: 'Premium Pricing', platform: 'Facebook', region: 'UK', adFlightStart: '2026-07-15', adFlightEnd: '2026-10-15', operator: 'Sarah Jenkins', taskAssignedTime: '2026-07-13 14:15', publishDate: '2026-07-14', launchingPrioritization: 'Medium', taskStatus: 'Trafficked', socialiteNotes: '-', traffickerComments: 'Pixel tracking successfully validated', qcThread: 'QC-890', qcer: 'Alex Smith', qcStatus: 'Approved' }
        ]
    };

    useEffect(() => {
        setLoading(true);
        const mockTimeout = setTimeout(() => {
            // Fallback cleanly to the full 'all' list if dynamic status code doesn't map perfectly
            const targetedDummyData = MOCK_DATA_BY_STATUS[activeStatus] || MOCK_DATA_BY_STATUS.all;
            setTickets(targetedDummyData);
            setLoading(false);
        }, 400);

        return () => clearTimeout(mockTimeout);
    }, [activeStatus]);

    return (
        <div className="tickets-page">
            <StatusCards
                counts={counts}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
            />
            <TicketsTable
                tickets={tickets}
                loading={loading}
                activeStatus={activeStatus}
                onOperatorChange={handleOperatorChange}
            />
        </div>
    );
};

export default Tickets;