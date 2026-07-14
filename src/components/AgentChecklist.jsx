import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

// Import local JSON files
import CalendarInviteData from '../data/CalendarInvite.json';
import KoreaKContentData from '../data/KoreaKContent.json';
import PaidSocialData from '../data/PaidSocial.json';
import YouTubeData from '../data/YouTube.json';
import SocialMediaData from '../data/SocialMedia.json';
import SocialiteData from '../data/Socialite.json';
import useApiCaller from '../utils/hooks/useApicaller';

const AgentChecklist = ({ onClose }) => {
const { qaReviewId } = useParams();
const [searchParams] = useSearchParams();
const assignmentId = searchParams.get('assignmentId');
// Socialite link forwarded from the Agent dashboard checklist button (in the URL,
// because window.open opens a fresh tab where react-router location state isn't available).
const socialiteLinkFromUrl = searchParams.get('socialiteLink') || '';
console.log(assignmentId,qaReviewId)
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  
  // Support for different checkbox structures
  const [checkboxGroupItems, setCheckboxGroupItems] = useState([]);
  const [checkboxGroupTitle, setCheckboxGroupTitle] = useState('');
  const [checkboxSections, setCheckboxSections] = useState([]);
  const [dynamicSections, setDynamicSections] = useState(null);
  const [selectedRequestType, setSelectedRequestType] = useState('');
  
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [checkboxData, setCheckboxData] = useState({});
  const [traffickerName, setTraffickerName] = useState('');
  const [shift, setShift] = useState('');
  const { fetchData} = useApiCaller();
  
  // Auto-save timer ref
  const autoSaveTimerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Storage key for localStorage
  const getStorageKey = () => {
    return `agent_checklist_${qaReviewId}_${assignmentId}`;
  };

  // Build a checkbox key. For multi-section checklists (checkboxSections) the
  // key is scoped by section index so identical item text in different sections
  // does not collide. When sectionIndex is omitted it returns the plain key
  // (used by single-section / checkboxGroup / dynamicSections structures).
  const getCheckboxKey = (item, sectionIndex) =>
    sectionIndex === undefined || sectionIndex === null
      ? item.replace(/[^a-zA-Z0-9]/g, '')
      : `sec${sectionIndex}_${item.replace(/[^a-zA-Z0-9]/g, '')}`;

  // Save to localStorage
  const saveToLocalStorage = () => {
    try {
      const storageKey = getStorageKey();
      const saveData = {
        selectedTaskType,
        formData,
        checkboxData,
        shift,
        traffickerName: currentUser?.name || traffickerName,
        checklistItems,
        checkboxGroupItems,
        checkboxGroupTitle,
        checkboxSections,
        selectedRequestType,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      console.log('Saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const storageKey = getStorageKey();
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    try {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
      console.log('Cleared localStorage');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Auto-save to backend
  const autoSaveToBackend = async () => {
    if (!selectedTaskType) return;
    
    try {
      let requestBody = {};
      
      if (selectedTaskType.value === 'CalendarInvite') {
        requestBody = {
          traffickerName: currentUser?.name || traffickerName,
          shift: shift,
          assignmentId: assignmentId,
          adTech: selectedTaskType.value,
          calendarInviteSubject: formData.calendarInviteSubject || '',
          socialiteLink: formData.socialiteLink || '',
          ticketId: qaReviewId,
          checkboxes: checkboxData
        };
      } else if (selectedTaskType.value === 'KoreaKContent') {
        requestBody = {
          traffickerName: currentUser?.name || traffickerName,
          shift: shift,
          assignmentId: assignmentId,
          adTech: selectedTaskType.value,
          typeOfAsset: formData.typeOfAsset || '',
          socialiteLink: formData.socialiteLink || '',
          mondayLink: formData.mondayLink || '',
          youtubeTitleName: formData.youtubeTitleName || '',
          youtubeChannel: formData.youtubeChannel || '',
          nptSchedule: formData.nptSchedule || '',
          finalCommsCheckedBy: formData.finalCommsCheckedBy || '',
          checkboxes: checkboxData,
          ticketId: qaReviewId
        };
      } else if (selectedTaskType.value === 'YouTube') {
        if (selectedRequestType === 'Debut') {
          const assetReviewCheckboxes = {};
          const copyReviewCheckboxes = {};
          const thumbnailLocalizedCheckboxes = {};
          const nptPostingRestCheckboxes = {};
          
          const debutSections = dynamicSections?.Debut || [];
          
          debutSections.forEach(section => {
            const processType = section.process;
            section.items.forEach(item => {
              const key = item.replace(/[^a-zA-Z0-9]/g, '');
              const value = checkboxData[key] || false;
              
              if (processType === 'Asset Review') {
                assetReviewCheckboxes[key] = value;
              } else if (processType === 'Copy Review') {
                copyReviewCheckboxes[key] = value;
              } else if (processType === 'Thumbnail versions & Localized versions') {
                thumbnailLocalizedCheckboxes[key] = value;
              } else if (processType === 'NPT Posting & Rest') {
                nptPostingRestCheckboxes[key] = value;
              }
            });
          });
          
          requestBody = {
            traffickerName: currentUser?.name || traffickerName,
            shift: shift,
            assignmentId: assignmentId,
            adTech: selectedTaskType.value,
            requestType: selectedRequestType,
            process: formData.process,
            socialiteLink: formData.socialiteLink || '',
            mondayLink: formData.mondayLink || '',
            youtubeChannel: formData.youtubeChannel || '',
            assetReviewCheckboxes,
            copyReviewCheckboxes,
            thumbnailLocalizedCheckboxes,
            nptPostingRestCheckboxes,
            ticketId: qaReviewId
          };
        } else if (selectedRequestType === 'Non Debut') {
          const nonDebutCheckboxes = {};
          const nonDebutSections = dynamicSections['Non Debut'] || [];
          
          nonDebutSections.forEach(section => {
            section.items.forEach(item => {
              const key = item.replace(/[^a-zA-Z0-9]/g, '');
              nonDebutCheckboxes[key] = checkboxData[key] || false;
            });
          });
          
          requestBody = {
            traffickerName: currentUser?.name || traffickerName,
            shift: shift,
            assignmentId: assignmentId,
            adTech: selectedTaskType.value,
            requestType: selectedRequestType,
            socialiteLink: formData.socialiteLink || '',
            mondayLink: formData.mondayLink || '',
            youtubeChannel: formData.youtubeChannel || '',
            finalCommsCheckedBy: formData.finalCommsCheckedBy || '',
            liveQCDoneBy: formData.liveQCDoneBy || '',
            nonDebutCheckboxes,
            ticketId: qaReviewId
          };
        } else {
          const otherCheckboxes = {};
          const otherSections = dynamicSections[selectedRequestType] || [];
          
          otherSections.forEach(section => {
            section.items.forEach(item => {
              const key = item.replace(/[^a-zA-Z0-9]/g, '');
              otherCheckboxes[key] = checkboxData[key] || false;
            });
          });
          
          requestBody = {
            traffickerName: currentUser?.name || traffickerName,
            shift: shift,
            assignmentId: assignmentId,
            adTech: selectedTaskType.value,
            requestType: selectedRequestType,
            socialiteLink: formData.socialiteLink || '',
            mondayLink: formData.mondayLink || '',
            youtubeChannel: formData.youtubeChannel || '',
            finalCommsCheckedBy: formData.finalCommsCheckedBy || '',
            liveQCDoneBy: formData.liveQCDoneBy || '',
            checkboxes: otherCheckboxes,
            ticketId: qaReviewId
          };
        }
      } else if (selectedTaskType.value === 'PaidSocial') {
        const metaChecklist = {};
        const googleAdsChecklist = {};
        const tiktokChecklist = {};
        const snapchatChecklist = {};
        const redditChecklist = {};
        const twitterChecklist = {};
        const paidYTUnlistedChecklist = {};
        
        if (checkboxSections.length > 0) {
          const metaItems = checkboxSections[0]?.items || [];
          metaItems.forEach((item) => {
            const key = getCheckboxKey(item, 0);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) metaChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) metaChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) metaChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("correct title page")) metaChecklist.correctTitlePageSelected = value;
            else if (item.includes("media assets")) metaChecklist.mediaAssetsSelectedCorrectly = value;
            else if (item.includes("Primary Text, Headline, and Description")) metaChecklist.primaryTextHeadlineDescriptionAdded = value;
            else if (item.includes("appropriate Call-to-Action")) metaChecklist.appropriateCTASelected = value;
            else if (item.includes("Destination link (ODP)")) metaChecklist.odpLinkAddedAndTested = value;
            else if (item.includes("ad was saved successfully")) metaChecklist.adSavedSuccessfully = value;
            else if (item.includes("ad is currently OFF")) metaChecklist.adCurrentlyOffAfterTrafficking = value;
            else if (item.includes("Calendar invite was sent")) metaChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) metaChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) metaChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) metaChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) metaChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) metaChecklist.notApplicable = value;
          });
          
          const googleItems = checkboxSections[1]?.items || [];
          googleItems.forEach((item) => {
            const key = getCheckboxKey(item, 1);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) googleAdsChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were checked")) googleAdsChecklist.campaignAndAdSetChecked = value;
            else if (item.includes("YouTube video was added")) googleAdsChecklist.youtubeVideoAdded = value;
            else if (item.includes("correct ODP link was used")) googleAdsChecklist.correctODPLinkUsed = value;
            else if (item.includes("Display URL was added")) googleAdsChecklist.displayURLAdded = value;
            else if (item.includes("appropriate CTA was selected")) googleAdsChecklist.appropriateCTASelected = value;
            else if (item.includes("Title name was added in the Headline")) googleAdsChecklist.titleNameAdded = value;
            else if (item.includes("Companion Banner was selected")) googleAdsChecklist.companionBannerSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) googleAdsChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("ad was saved successfully")) googleAdsChecklist.adSavedSuccessfully = value;
            else if (item.includes("ad is currently OFF")) googleAdsChecklist.adCurrentlyOffAfterTrafficking = value;
            else if (item.includes("Calendar invite was sent")) googleAdsChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) googleAdsChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) googleAdsChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) googleAdsChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) googleAdsChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) googleAdsChecklist.notApplicable = value;
          });
          
          const tiktokItems = checkboxSections[2]?.items || [];
          tiktokItems.forEach((item) => {
            const key = getCheckboxKey(item, 2);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) tiktokChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) tiktokChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) tiktokChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("correct title page")) tiktokChecklist.correctTitlePageSelected = value;
            else if (item.includes("media (Thumbnail and Video) were selected")) tiktokChecklist.mediaSelectedCorrectly = value;
            else if (item.includes("text was added as per the Socialite tool")) tiktokChecklist.textAddedPerSocialite = value;
            else if (item.includes("appropriate CTA was selected")) tiktokChecklist.appropriateCTASelected = value;
            else if (item.includes("URL (ODP link) was added")) tiktokChecklist.odpLinkAddedAndVerified = value;
            else if (item.includes("Direct users to deeplink first")) tiktokChecklist.deeplinkCheckboxTicked = value;
            else if (item.includes("Unchecked authorization checkbox")) tiktokChecklist.authorizationCheckboxUnchecked = value;
            else if (item.includes("ad was saved successfully")) tiktokChecklist.adSavedSuccessfully = value;
            else if (item.includes("Calendar invite was sent")) tiktokChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) tiktokChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) tiktokChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) tiktokChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) tiktokChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) tiktokChecklist.notApplicable = value;
          });
          
          const snapchatItems = checkboxSections[3]?.items || [];
          snapchatItems.forEach((item) => {
            const key = getCheckboxKey(item, 3);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) snapchatChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) snapchatChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) snapchatChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("media (Thumbnail and Video) were selected")) snapchatChecklist.mediaSelectedCorrectly = value;
            else if (item.includes("public profile was selected as Netflix")) snapchatChecklist.publicProfileSelected = value;
            else if (item.includes("Title name was added in the Headline")) snapchatChecklist.titleAddedInHeadline = value;
            else if (item.includes("media was uploaded using the Upload option")) snapchatChecklist.mediaUploadedUsingUploadOption = value;
            else if (item.includes("Shareable & Ad Favoriting checkbox")) snapchatChecklist.shareableAndAdFavoritingEnabled = value;
            else if (item.includes("Status checkbox option was selected to keep the ad Paused")) snapchatChecklist.statusCheckboxSelectedPaused = value;
            else if (item.includes("Attachment was selected as Website")) snapchatChecklist.attachmentSelectedAsWebsite = value;
            else if (item.includes("appropriate CTA was selected")) snapchatChecklist.appropriateCTASelected = value;
            else if (item.includes("Status option was checked to pause the ad")) snapchatChecklist.statusOptionCheckedToPauseAd = value;
            else if (item.includes("ad was saved using Review & Publish")) snapchatChecklist.adSavedUsingReviewPublish = value;
            else if (item.includes("Calendar invite was sent")) snapchatChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) snapchatChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) snapchatChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) snapchatChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) snapchatChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) snapchatChecklist.notApplicable = value;
          });
          
          const redditItems = checkboxSections[4]?.items || [];
          redditItems.forEach((item) => {
            const key = getCheckboxKey(item, 4);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) redditChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) redditChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) redditChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("Creative Type")) redditChecklist.creativeTypeSelected = value;
            else if (item.includes("Headline (Description) was filled")) redditChecklist.headlineFilledUsingPSTTool = value;
            else if (item.includes("confirmation was taken from the requester")) redditChecklist.requesterConfirmationTaken = value;
            else if (item.includes("video was uploaded")) redditChecklist.videoUploadedCorrectly = value;
            else if (item.includes("appropriate Call to Action was selected")) redditChecklist.appropriateCTASelected = value;
            else if (item.includes("ad was saved and published")) redditChecklist.adSavedAndPublished = value;
            else if (item.includes("Calendar invite was sent")) redditChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) redditChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) redditChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) redditChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) redditChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) redditChecklist.notApplicable = value;
          });
          
          const twitterItems = checkboxSections[5]?.items || [];
          twitterItems.forEach((item) => {
            const key = getCheckboxKey(item, 5);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) twitterChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) twitterChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Creative and Media option was clicked")) twitterChecklist.creativeAndMediaClicked = value;
            else if (item.includes("media was uploaded using the Upload Media button")) twitterChecklist.mediaUploadedUsingUploadButton = value;
            else if (item.includes("copy was added from the PST tool")) twitterChecklist.copyAddedFromPSTTool = value;
            else if (item.includes("thumbnail was changed using the Edit Media option")) twitterChecklist.thumbnailChangedUsingEditMedia = value;
            else if (item.includes("appropriate Call to Action was selected")) twitterChecklist.appropriateCTASelected = value;
            else if (item.includes("Allow playback in embedded posts option was checked")) twitterChecklist.allowPlaybackChecked = value;
            else if (item.includes("Promoted only option was selected")) twitterChecklist.promotedOnlySelected = value;
            else if (item.includes("Post option was clicked to Tweet")) twitterChecklist.postOptionClickedToTweet = value;
            else if (item.includes("campaign and ad set were checked again")) twitterChecklist.campaignCheckedAgain = value;
            else if (item.includes("Edit Ad Group option was selected")) twitterChecklist.editAdGroupSelected = value;
            else if (item.includes("top left thread was clicked")) twitterChecklist.topLeftThreadSelected = value;
            else if (item.includes("Create Another Ad option was clicked")) twitterChecklist.createAnotherAdClicked = value;
            else if (item.includes("Use Existing Ad option was selected")) twitterChecklist.useExistingAdSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) twitterChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("Next button was clicked to publish the ad")) twitterChecklist.nextButtonClicked = value;
            else if (item.includes("Calendar invite was sent")) twitterChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) twitterChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) twitterChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) twitterChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) twitterChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) twitterChecklist.notApplicable = value;
          });
          
          const paidYTUnlistedItems = checkboxSections[6]?.items || [];
          paidYTUnlistedItems.forEach((item) => {
            const key = getCheckboxKey(item, 6);
            const value = checkboxData[key] || false;
            if (item.includes("notes or special instructions were checked")) paidYTUnlistedChecklist.notesCheckedAcrossTools = value;
            else if (item.includes("asset was reviewed according to the checklist")) paidYTUnlistedChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("in-burnt subtitles were checked")) paidYTUnlistedChecklist.inBurntSubtitlesChecked = value;
            else if (item.includes("title and description were prepared")) paidYTUnlistedChecklist.titleAndDescriptionPrepared = value;
            else if (item.includes("thumbnail was taken from PST/Socialite")) paidYTUnlistedChecklist.thumbnailVerified = value;
            else if (item.includes("Official Trailer 16x9 Clean thumbnail has been used")) paidYTUnlistedChecklist.officialTrailerThumbnailUsed = value;
            else if (item.includes("final YouTube copy was added")) paidYTUnlistedChecklist.finalYoutubeCopyAdded = value;
            else if (item.includes("assets are pushed to the correct NPT Campaign")) paidYTUnlistedChecklist.assetsPushedToCorrectCampaign = value;
            else if (item.includes("posts are made Unlisted ASAP")) paidYTUnlistedChecklist.postsMadeUnlistedASAP = value;
            else if (item.includes("YT Unlisted links are added to PST/Socialite")) paidYTUnlistedChecklist.ytLinksAddedToPST = value;
            else if (item.includes("necessary details are updated in the PST/Socialite")) paidYTUnlistedChecklist.necessaryDetailsUpdated = value;
            else if (item.includes("final communications were sent")) paidYTUnlistedChecklist.finalCommunicationsSent = value;
            else if (item.includes("details are added to Global QC Base")) paidYTUnlistedChecklist.detailsAddedToGlobalQCBase = value;
            else if (item.includes("posts are sent to QC by Informing in the Slack")) paidYTUnlistedChecklist.postsSentToQC = value;
            else if (item.includes("handoff has been shared to QM")) paidYTUnlistedChecklist.handoffSharedToQM = value;
            else if (item.includes("asset has been reviewed in line with the checklist") && !item.includes("according to the checklist")) paidYTUnlistedChecklist.assetReviewedAgain = value;
            else if (item.includes("approved copy is used")) paidYTUnlistedChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) paidYTUnlistedChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) paidYTUnlistedChecklist.notApplicable = value;
          });
        }
        
        requestBody = {
          traffickerName: currentUser?.name || traffickerName,
          shift: shift,
          assignmentId: assignmentId,
          ticketId: qaReviewId,
          adTech: selectedTaskType.value,
          atLink: formData.atLink || '',
          slackLink: formData.slackLink || '',
          ytLink: formData.ytLink || '',
          metaChecklist,
          googleAdsChecklist,
          tiktokChecklist,
          snapchatChecklist,
          redditChecklist,
          twitterChecklist,
          paidYTUnlistedChecklist
        };
      } else if (selectedTaskType.value === 'SocialMedia') {
        const twoStepVerificationCode = {};
        const accessRequest = {};
        const accessRemoveTakedown = {};
        const pageCreation = {};
        
        if (checkboxSections.length > 0) {
          const twoStepItems = checkboxSections[0]?.items || [];
          twoStepItems.forEach((item) => {
            const key = getCheckboxKey(item, 0);
            const value = checkboxData[key] || false;
            if (item.includes("DMed the code to the user")) twoStepVerificationCode.dmedCodeToUser = value;
            else if (item.includes("updated the Monday board and UT sheet")) twoStepVerificationCode.updatedMondayBoardAndUTSheet = value;
            else if (item.includes("NA")) twoStepVerificationCode.notApplicable = value;
          });
          
          const accessRequestItems = checkboxSections[1]?.items || [];
          accessRequestItems.forEach((item) => {
            const key = getCheckboxKey(item, 1);
            const value = checkboxData[key] || false;
            if (item.includes("Full-Time Employee access provided")) accessRequest.fullTimeEmployeeAccessProvided = value;
            else if (item.includes("Agency, checked the duration")) accessRequest.agencyAccessProvided = value;
            else if (item.includes("if duration provided, sent the calendar invite")) accessRequest.calendarInviteSentIfDurationProvided = value;
            else if (item.includes("NA")) accessRequest.notApplicable = value;
          });
          
          const accessRemoveItems = checkboxSections[2]?.items || [];
          accessRemoveItems.forEach((item) => {
            const key = getCheckboxKey(item, 2);
            const value = checkboxData[key] || false;
            if (item.includes("removed the access from the platform")) accessRemoveTakedown.accessRemovedFromPlatform = value;
            else if (item.includes("informed the user")) accessRemoveTakedown.informedUser = value;
            else if (item.includes("updated the Monday board and UT sheet")) accessRemoveTakedown.updatedMondayBoardAndUTSheet = value;
            else if (item.includes("NA")) accessRemoveTakedown.notApplicable = value;
          });
          
          const pageCreationItems = checkboxSections[3]?.items || [];
          pageCreationItems.forEach((item) => {
            const key = getCheckboxKey(item, 3);
            const value = checkboxData[key] || false;
            if (item.includes("created the page")) pageCreation.pageCreated = value;
            else if (item.includes("added the details for Instagram/Twitter/TikTok/Snapchat in 1P")) pageCreation.detailsAddedInIP = value;
            else if (item.includes("updated Airtable and Sprinklr")) pageCreation.updatedAirtableAndSprinklr = value;
            else if (item.includes("informed the requester")) pageCreation.informedRequester = value;
            else if (item.includes("updated the Monday board and UT sheet")) pageCreation.updatedMondayBoardAndUTSheet = value;
            else if (item.includes("NA")) pageCreation.notApplicable = value;
          });
        }
        
        requestBody = {
          traffickerName: currentUser?.name || traffickerName,
          shift: shift,
          assignmentId: assignmentId,
          adTech: selectedTaskType.value,
          ticketId: qaReviewId,
          ...formData,
          twoStepVerificationCode,
          accessRequest,
          accessRemoveTakedown,
          pageCreation
        };
} else if (selectedTaskType.value === 'Socialite') {
  const apiCheckboxes = {};
  
  // Map the descriptive text (exactly as it appears in your JSON) to API keys
  const descriptiveToApiKeyMap = [
    {
      descriptiveText: "Yes, confirmed receipt via Socialite comment.",
      apiKey: "confirmedReceiptViaSocialiteComment"
    },
    {
      descriptiveText: "Schedule->> **Yes**, confirming that the Socialite post publish date and time were reviewed against the Project Earliest Date and Time listed in Socialite. The post is getting published at the same time as, or later than, the Project Earliest Date and Time. (Note: The Project level Earliest Post Date and Time must always be the same as, or earlier than, the Socialite post publish date and time.)",
      apiKey: "publishDateReviewedAgainstEarliestDate"
    },
    {
      descriptiveText: "Yes, rescheduled the post in NPT.",
      apiKey: "rescheduledPostInNPT"
    },
    {
      descriptiveText: "Yes, added comment in Debut sheet Notes column.",
      apiKey: "addedCommentInDebutSheetNotes"
    },
    {
      descriptiveText: "Yes, created a comment in the debut sheet following the template, addressed the Campaign Ops lead(s), included the requestor for added context, and cc'd media ops YouTube.",
      apiKey: "createdCommentInDebutSheet"
    },
    {
      descriptiveText: "Yes, confirmed back to Social Marketing on Socialite comment (Project level).",
      apiKey: "confirmedBackToSocialMarketing"
    },
    {
      descriptiveText: "Yes, in Socialite, removed the channel in question from the original post.",
      apiKey: "removedChannelFromOriginalPost"
    },
    {
      descriptiveText: "Yes, created a new Socialite post for the channel in question with the appropriate details: (a. Enabled the YouTube Debut checkbox., b. Added the localized copy, thumbnail link, revised timing, etc., for that channel., c. Saved the post status as Scheduled.)",
      apiKey: "createdNewSocialitePost"
    },
    {
      descriptiveText: "Yes, checked that the debut is showing up properly on that channel's calendar in Socialite.",
      apiKey: "checkedDebutShowingProperly"
    }
  ];
  
  // Generate the key from descriptive text (same method as in renderCheckboxes)
  descriptiveToApiKeyMap.forEach(({ descriptiveText, apiKey }) => {
    const generatedKey = descriptiveText.replace(/[^a-zA-Z0-9]/g, '');
    const value = checkboxData[generatedKey] || false;
    apiCheckboxes[apiKey] = value;
    console.log(`Mapping: "${generatedKey}" -> ${value} -> ${apiKey}`);
  });
  
  console.log('Final apiCheckboxes:', apiCheckboxes);
  
  requestBody = {
    traffickerName: currentUser?.name || traffickerName,
    shift: shift,
    assignmentId: assignmentId,
    adTech: selectedTaskType.value,
    ticketId: qaReviewId,
    ...formData,
    checkboxes: apiCheckboxes
  };
}
      
      if (Object.keys(requestBody).length > 0) {
        await fetchData("POST", 'checklists/save-draft', requestBody);
        console.log('Auto-saved to backend');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  // Trigger auto-save with debounce
  const triggerAutoSave = () => {
    // Save to localStorage immediately
    saveToLocalStorage();
    
    // Debounce backend auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveToBackend();
    }, 1500);
  };

  // Auto-save whenever form data changes
  useEffect(() => {
    if (!isInitialLoadRef.current && selectedTaskType) {
      triggerAutoSave();
    }
  }, [formData, checkboxData, selectedRequestType, shift, selectedTaskType]);

  // Set default trafficker name from currentUser immediately
  useEffect(() => {
    if (currentUser?.name) {
      setTraffickerName(currentUser.name);
    }
  }, [currentUser]);

  // Pre-fill the Socialite link input with the value forwarded from the dashboard,
  // once a checklist with a "socialiteLink" field is loaded. Only fills when empty so
  // a manually edited / restored value is never overwritten.
  useEffect(() => {
    if (!socialiteLinkFromUrl) return;
    const hasSocialiteField = checklistItems.some(item => item.key === 'socialiteLink');
    if (!hasSocialiteField) return;
    setFormData(prev =>
      prev.socialiteLink ? prev : { ...prev, socialiteLink: socialiteLinkFromUrl }
    );
  }, [checklistItems, socialiteLinkFromUrl]);

  // Initialize task types immediately
  useEffect(() => {
    const allTaskTypes = Object.entries(taskTypeMapping).map(([displayName, value]) => ({
      displayName: displayName,
      value: value
    }));
    setTaskTypes(allTaskTypes);
  }, []);

  // Mapping between display names and API values
  const taskTypeMapping = {
    'Calendar Invite': 'CalendarInvite',
    'Korea & K-Content': 'KoreaKContent',
    'Paid Social': 'PaidSocial',
    'YouTube': 'YouTube',
    'Social Media access': 'SocialMedia',
    'Socialite Date Change': 'Socialite'
  };

  // Get local checklist data based on adTech
  const getLocalChecklistData = (adTech) => {
    switch(adTech) {
      case 'CalendarInvite':
        return CalendarInviteData;
      case 'KoreaKContent':
        return KoreaKContentData;
      case 'PaidSocial':
        return PaidSocialData;
      case 'YouTube':
        return YouTubeData;
      case 'SocialMedia':
        return SocialMediaData;
      case 'Socialite':
        return SocialiteData;
      default:
        return null;
    }
  };

  // Load checklist on mount
  useEffect(() => {
    if (qaReviewId && assignmentId) {
      const localData = loadFromLocalStorage();
      
      if (localData && localData.selectedTaskType) {
        Swal.fire({
          title: 'Unsaved Changes Found',
          text: 'Do you want to continue with your unsaved changes?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, continue editing',
          cancelButtonText: 'No, start fresh',
          background: '#1a1a1a',
          color: '#e5e5e5',
          confirmButtonColor: '#e50914'
        }).then((result) => {
          if (result.isConfirmed) {
            restoreFromLocalData(localData);
          } else {
            clearLocalStorage();
            // Reset all entered fields back to empty
            setSelectedTaskType(null);
            setSelectedRequestType('');
            setFormData({});
            setCheckboxData({});
            setShift('');
            setChecklistItems([]);
            setCheckboxGroupItems([]);
            setCheckboxGroupTitle('');
            setCheckboxSections([]);
            setDynamicSections(null);
            isInitialLoadRef.current = false;
          }
        });
      } else {
        isInitialLoadRef.current = false;
      }
    }
  }, [qaReviewId, assignmentId]);

  // Restore data from localStorage
  const restoreFromLocalData = async (localData) => {
    try {
      if (localData.selectedTaskType) {
        setSelectedTaskType(localData.selectedTaskType);
        await fetchChecklistItemsFromLocal(localData.selectedTaskType.value);
        
        setFormData(localData.formData || {});
        setCheckboxData(localData.checkboxData || {});
        setShift(localData.shift || '');
        setSelectedRequestType(localData.selectedRequestType || '');
        
        if (localData.traffickerName && !currentUser?.name) {
          setTraffickerName(localData.traffickerName);
        }
        
        isInitialLoadRef.current = false;
      }
    } catch (error) {
      console.error('Error restoring from localStorage:', error);
      isInitialLoadRef.current = false;
    }
  };

  // Fetch checklist items from local JSON files
  const fetchChecklistItemsFromLocal = async (taskTypeValue, savedData = null) => {
    try {
      setLoadingChecklist(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const checklistData = getLocalChecklistData(taskTypeValue);
      
      if (checklistData) {
        let transformedItems = [];
        if (checklistData.formFields && checklistData.formFields.length > 0) {
          transformedItems = checklistData.formFields.map(field => ({
            key: field.key,
            label: field.label,
            type: field.type,
            required: field.required || false,
            options: field.options || []
          }));
        }
        
        setChecklistItems(transformedItems);
        
        if (checklistData.checkboxSections && checklistData.checkboxSections.length > 0) {
          setCheckboxSections(checklistData.checkboxSections);
          setCheckboxGroupItems([]);
          setCheckboxGroupTitle('');
          setDynamicSections(null);
        } else if (checklistData.dynamicSections) {
          setDynamicSections(checklistData.dynamicSections);
          setCheckboxSections([]);
          setCheckboxGroupItems([]);
          setCheckboxGroupTitle('');
        } else if (checklistData.checkboxGroup && checklistData.checkboxGroup.items) {
          setCheckboxGroupItems(checklistData.checkboxGroup.items);
          setCheckboxGroupTitle(checklistData.checkboxGroup.title);
          setCheckboxSections([]);
          setDynamicSections(null);
        } else {
          setCheckboxGroupItems([]);
          setCheckboxGroupTitle('');
          setCheckboxSections([]);
          setDynamicSections(null);
        }
        
        if (!savedData && isInitialLoadRef.current) {
          const localData = loadFromLocalStorage();
          if (localData && localData.selectedTaskType?.value === taskTypeValue) {
            setFormData(localData.formData || {});
            setCheckboxData(localData.checkboxData || {});
            setSelectedRequestType(localData.selectedRequestType || '');
          } else {
            const initialFormData = {};
            if (transformedItems.length > 0) {
              transformedItems.forEach(item => {
                if (item.type === 'select') {
                  initialFormData[item.key] = '';
                } else if (item.type === 'text') {
                  initialFormData[item.key] = '';
                }
              });
            }
            setFormData(initialFormData);
            
            const initialCheckboxData = {};
            
            if (checklistData.checkboxSections) {
              checklistData.checkboxSections.forEach((section, sIdx) => {
                section.items.forEach(item => {
                  const key = getCheckboxKey(item, sIdx);
                  initialCheckboxData[key] = false;
                });
              });
            } else if (checklistData.checkboxGroup && checklistData.checkboxGroup.items) {
              checklistData.checkboxGroup.items.forEach(item => {
                const key = item.replace(/[^a-zA-Z0-9]/g, '');
                initialCheckboxData[key] = false;
              });
            }
            
            setCheckboxData(initialCheckboxData);
            setSelectedRequestType('');
          }
        }
      } else {
        console.error(`No local data found for adTech: ${taskTypeValue}`);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Checklist form not found for ${taskTypeValue}`,
          background: '#1a1a1a',
          color: '#e5e5e5'
        });
      }
    } catch (error) {
      console.error("Error fetching checklist items from local:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load checklist items',
        background: '#1a1a1a',
        color: '#e5e5e5'
      });
    } finally {
      setLoadingChecklist(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCheckboxChange = (key, checked) => {
      console.log(`Setting checkbox: ${key} = ${checked}`);
    setCheckboxData(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleRequestTypeChange = (requestType) => {
    setSelectedRequestType(requestType);
    setCheckboxData({});
  };

const validateForm = () => {
  if (!selectedTaskType) {
    Swal.fire({
      icon: 'warning',
      title: 'No Task Type Selected',
      text: 'Please select a task type before submitting',
      background: '#1a1a1a',
      color: '#e5e5e5',
      confirmButtonColor: '#e50914'
    });
    return false;
  }

  if (!traffickerName.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Agent Name',
      text: 'Agent name is required',
      background: '#1a1a1a',
      color: '#e5e5e5',
      confirmButtonColor: '#e50914'
    });
    return false;
  }

  const missingFields = [];
  const missingSections = new Map();

  // Helper function to generate consistent key (section-scoped for checkboxSections)
  const generateKey = (text, sectionIndex) => {
    return getCheckboxKey(text, sectionIndex);
  };

  // 1. Check required form fields
  checklistItems.forEach(item => {
    if (item.required) {
      const value = formData[item.key];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push({
          label: item.label,
          type: 'form-field',
          key: item.key
        });
      }
    }
  });

  // 2. Check QC Sign-off fields for YouTube Non Debut and other request types
  if (selectedTaskType?.value === 'YouTube' && 
      selectedRequestType && 
      selectedRequestType !== 'Debut') {
    
    if (!formData.finalCommsCheckedBy || formData.finalCommsCheckedBy.trim() === '') {
      missingFields.push({
        label: 'Final Comms checked by',
        type: 'form-field',
        key: 'finalCommsCheckedBy'
      });
    }
    
    if (!formData.liveQCDoneBy || formData.liveQCDoneBy.trim() === '') {
      missingFields.push({
        label: 'Live QC done by',
        type: 'form-field',
        key: 'liveQCDoneBy'
      });
    }
  }

  // 3. Check required checkboxes for YouTube dynamicSections
  if (dynamicSections && selectedTaskType?.value === 'YouTube') {
    
    // For Debut sections
    if (selectedRequestType === 'Debut') {
      const selectedProcess = formData.process;
      
      if (!selectedProcess) {
        missingFields.push({
          label: 'Process Selection',
          type: 'form-field',
          key: 'process'
        });
      } else {
        const debutSections = dynamicSections.Debut || [];
        const sectionsToShow = debutSections.filter(
          section => section.process === selectedProcess
        );
        
        sectionsToShow.forEach(section => {
          const isSectionRequired = section.sectionTitle.includes('*');
          
          if (isSectionRequired) {
            let hasAnyCheckboxChecked = false;
            
            for (const item of section.items) {
              const key = generateKey(item);
              if (checkboxData[key] === true) {
                hasAnyCheckboxChecked = true;
                break;
              }
            }
            
            const naItem = section.items.find(item => 
              item === "NA" || 
              item.toLowerCase().includes('na') || 
              item.toLowerCase().includes('not applicable')
            );
            let isNaChecked = false;
            if (naItem) {
              const naKey = generateKey(naItem);
              if (checkboxData[naKey] === true) {
                isNaChecked = true;
              }
            }
            
            if (!hasAnyCheckboxChecked && !isNaChecked) {
              const cleanTitle = section.sectionTitle.replace(/\*/g, '').trim();
              missingSections.set(section.sectionTitle, {
                label: cleanTitle,
                type: 'checkbox-section',
                originalTitle: section.sectionTitle
              });
            }
          }
        });
      }
    }
    
    // For Non Debut and other request types - NOW REQUIRES AT LEAST ONE CHECKBOX OR NA
    if (selectedRequestType === 'Non Debut' || 
        selectedRequestType === 'TUDUM' || 
        selectedRequestType === 'Geeked Week' || 
        selectedRequestType === 'SAG' || 
        selectedRequestType === 'NoN' ||
        selectedRequestType === 'Channel Operations') {
      
      const nonDebutSections = dynamicSections['Non Debut'] || [];
      
      nonDebutSections.forEach(section => {
        const isSectionRequired = section.sectionTitle.includes('*');
        
        if (isSectionRequired) {
          // Check if at least one checkbox is checked
          let hasAnyCheckboxChecked = false;
          
          for (const item of section.items) {
            const key = generateKey(item);
            if (checkboxData[key] === true) {
              hasAnyCheckboxChecked = true;
              break;
            }
          }
          
          // Check if NA is checked (NA counts as valid)
          const naItem = section.items.find(item => 
            item === "NA" || 
            item.toLowerCase().includes('na') || 
            item.toLowerCase().includes('not applicable')
          );
          let isNaChecked = false;
          if (naItem) {
            const naKey = generateKey(naItem);
            if (checkboxData[naKey] === true) {
              isNaChecked = true;
            }
          }
          
          // Only show error if NO checkboxes are checked AND NA is not checked
          if (!hasAnyCheckboxChecked && !isNaChecked) {
            const cleanTitle = section.sectionTitle.replace(/\*/g, '').trim();
            missingSections.set(section.sectionTitle, {
              label: cleanTitle,
              type: 'checkbox-section',
              originalTitle: section.sectionTitle
            });
          }
        }
      });
    }
  }

  // 4. Check required checkbox sections (for checkboxSections structure)
  if (checkboxSections.length > 0) {
    checkboxSections.forEach((section, sIdx) => {
      const isSectionRequired = section.sectionTitle?.includes('*') || section.required === true;

      if (isSectionRequired) {
        let hasAnyCheckboxChecked = false;

        for (const item of section.items) {
          const key = generateKey(item, sIdx);
          if (checkboxData[key] === true) {
            hasAnyCheckboxChecked = true;
            break;
          }
        }

        const naItem = section.items.find(item =>
          item === "NA" ||
          item.toLowerCase().includes('na') ||
          item.toLowerCase().includes('not applicable')
        );
        let isNaChecked = false;
        if (naItem) {
          const naKey = generateKey(naItem, sIdx);
          if (checkboxData[naKey] === true) {
            isNaChecked = true;
          }
        }
        
        if (!hasAnyCheckboxChecked && !isNaChecked) {
          const cleanTitle = section.sectionTitle.replace(/\*/g, '').trim();
          missingSections.set(section.sectionTitle, {
            label: cleanTitle,
            type: 'checkbox-section',
            originalTitle: section.sectionTitle
          });
        }
      } else {
        // Check individual items with *
        section.items.forEach(item => {
          if (item.includes('*') && !item.toLowerCase().includes('na')) {
            const key = generateKey(item, sIdx);
            const isChecked = checkboxData[key] === true;
            
            if (!isChecked) {
              missingFields.push({
                label: item.replace(/\*/g, '').trim(),
                type: 'checkbox-item',
                key: key
              });
            }
          }
        });
      }
    });
  }

  // 5. Check required checkboxes for checkboxGroupItems
  if (checkboxGroupItems.length > 0 && checkboxGroupTitle) {
    const isGroupRequired = checkboxGroupTitle.includes('*');
    
    if (isGroupRequired) {
      let hasAnyChecked = false;
      
      for (const item of checkboxGroupItems) {
        const key = generateKey(item);
        if (checkboxData[key] === true) {
          hasAnyChecked = true;
          break;
        }
      }
      
      if (!hasAnyChecked) {
        const cleanTitle = checkboxGroupTitle.replace(/\*/g, '').trim();
        missingSections.set(checkboxGroupTitle, {
          label: cleanTitle,
          type: 'checkbox-group',
          originalTitle: checkboxGroupTitle
        });
      }
    } else {
      checkboxGroupItems.forEach(item => {
        if (item.includes('*') && !item.toLowerCase().includes('na')) {
          const key = generateKey(item);
          const isChecked = checkboxData[key] === true;
          
          if (!isChecked) {
            missingFields.push({
              label: item.replace(/\*/g, '').trim(),
              type: 'checkbox-item',
              key: key
            });
          }
        }
      });
    }
  }

  // Show error if any required fields are missing
  if (missingFields.length > 0 || missingSections.size > 0) {
    const fieldListItems = [];
    
    missingFields.forEach(field => {
      fieldListItems.push(`• ${field.label}`);
    });
    
    missingSections.forEach(section => {
      fieldListItems.push(`📋 ${section.label} (Please check at least one applicable checkbox or select "NA")`);
    });
    
    const fieldList = fieldListItems.join('<br/><br/>');
    
    Swal.fire({
      icon: 'warning',
      title: 'Missing Required Fields',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <p style="margin-bottom: 10px;">Please complete the following required fields before submitting:</p>
          <div style="background: rgba(229, 9, 20, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #e50914;">
            ${fieldList}
          </div>
          <p style="margin-top: 15px; font-size: 12px; color: #999;">Fields marked with <span style="color: #e50914;">*</span> are required.</p>
        </div>
      `,
      background: '#1a1a1a',
      color: '#e5e5e5',
      confirmButtonColor: '#e50914',
      confirmButtonText: 'Go to Missing Fields',
      showCancelButton: true,
      cancelButtonColor: '#404040',
      cancelButtonText: 'Cancel',
      width: '600px'
    }).then((result) => {
      if (result.isConfirmed) {
        if (missingFields.length > 0) {
          const firstMissingField = missingFields[0];
          const fieldElement = document.querySelector(`[data-field-key="${firstMissingField.key}"]`);
          if (fieldElement) {
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            fieldElement.style.transition = 'border 0.3s';
            fieldElement.style.border = '2px solid #e50914';
            setTimeout(() => {
              fieldElement.style.border = '';
            }, 2000);
          }
        } else if (missingSections.size > 0) {
          const firstSection = Array.from(missingSections.values())[0];
          const sectionHeaders = document.querySelectorAll('h3, h4, .section-title');
          for (let header of sectionHeaders) {
            if (header.textContent.includes(firstSection.label)) {
              header.scrollIntoView({ behavior: 'smooth', block: 'center' });
              header.style.transition = 'background 0.3s';
              header.style.backgroundColor = 'rgba(229, 9, 20, 0.2)';
              setTimeout(() => {
                header.style.backgroundColor = '';
              }, 2000);
              break;
            }
          }
        }
      }
    });
    return false;
  }
  
  return true;
};

  const submitChecklist = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    // Clear auto-save timer to avoid conflicts
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    try {
      let requestBody = {};
   if (selectedTaskType.value === 'CalendarInvite') {
  const checkboxMapping = {
    "postScheduledPublicPerSocialite": "Yes, the post is scheduled to go Public as per the Socialite public time and date.",
    "playlistStatusPublic": "Yes, Playlist status is currently public",
    "videoAddedToEndScreenElements": "Yes, the video has been added to the end screen elements of the provided videos in Socialite.",
    "socialiteStatusUpdatedPerCalendarInvite": "Yes, the Socialite Status has been updated as per the Calendar Invite.",
    "publishDateReviewedAgainstEarliestDate": "Schedule --> Yes, confirming that the Socialite post publish date and time were reviewed against the Project Earliest Date and Time listed in Socialite. The post is getting published at the same time as, or later than, the Project Earliest Date and Time. (Note: The Project level Earliest Post Date and Time must always be the same as, or earlier than, the Socialite post publish date and time.)",
    "playlistsAddedToPost": "Yes, the respective playlists have been added to the post.",
    "commentAddedAndPinned": "Yes, the comment has been added and pinned.",
    "abTestingThumbnailChecked": "Yes, the A/B testing thumbnail has been checked.",
    "thumbnailReflectingForShorts": "Yes, the thumbnail is reflecting properly for the Shorts post.",
    "soundtracksAddedToPlaylistInOrder": "Yes, all the Soundtracks videos have been added to the playlist as per the Track Sequence order.",
    "screenshotsTakenRepliesSent": "Yes, screenshots have been taken and replies have been sent to the Calendar via email.",
    "taskSentToQC": "Yes, the task has been sent to QC.",
    "noUnlistedVideosInPlaylist": "Yes, No unlisted videos are added in the playlist"
  };
  
  const apiCheckboxes = {};
  
  // Generate the transformed key from the descriptive text
  Object.entries(checkboxMapping).forEach(([apiKey, descriptiveLabel]) => {
    const transformedKey = descriptiveLabel.replace(/[^a-zA-Z0-9]/g, '');
    const value = checkboxData[transformedKey] || false;
    apiCheckboxes[apiKey] = value;
  });
  
  requestBody = {
    traffickerName: currentUser?.name || traffickerName,
    shift: shift,
    assignmentId: assignmentId,
    adTech: selectedTaskType.value,
    calendarInviteSubject: formData.calendarInviteSubject || '',
    socialiteLink: formData.socialiteLink || '',
    checkboxes: apiCheckboxes,
    ticketId: qaReviewId
  };
} else if (selectedTaskType.value === 'KoreaKContent') {
        const generateCheckboxKey = (itemText) => {
          return itemText.replace(/[^a-zA-Z0-9]/g, '');
        };
        const koreaKContentData = {
          typeOfAsset: formData.typeOfAsset || '',
          socialiteLink: formData.socialiteLink || '',
          mondayLink: formData.mondayLink || '',
          youtubeTitleName: formData.youtubeTitleName || '',
          youtubeChannel: formData.youtubeChannel || '',
          nptSchedule: formData.nptSchedule || '',
          finalCommsCheckedBy: formData.finalCommsCheckedBy || ''
        };
        
        const descriptiveToApiKeyMap = {
          "Yes, the asset has been thoroughly reviewed according to the checklist, YouTube guidelines, and instruction document. This includes checks on audio-video sync, subtitle accuracy, visual glitches, Netflix and ratings bugs, mid cards, translations, launch dates, CTAs, file size, IAAS inspection, technical specifications, black screens, end cards, end screens, title attribution, and all other relevant factors.": "assetReviewedPerChecklist",
          "Yes, the date in the end card has been checked. For Korean-origin debuts, a date is mandatory; for other debuts, it's acceptable if the date is missing.": "endCardDateChecked",
          "Yes, in-burnt subtitles (if present) have been verified for alignment with video content and channel language requirements, ensuring no overlap with visual elements.": "inBurntSubtitlesVerified",
          "Yes, the end screen has been stitched according to the respective channel and AdTech requirements. Channel-specific end screen for Netflix K-content Channel has been confirmed.": "endScreenStitchedPerChannel",
          "Yes, the thumbnail asset has been validated (Final Thumb vs Used Thumb), including text overlay accuracy, image quality, Netflix bug presence, resolution, and asset size.": "thumbnailValidated",
          "Yes, for shorts thumbnail, visual quality has been ensured—no cut-off or shaky actor faces, and eyes are open within the provided time code.": "shortsThumbnailQualityChecked",
          "Yes, all translations (titles, descriptions, burned-in subs) are in the correct language covering terminologies, NTV, MMT, text treatments, and channel-specific language requirements.": "translationsCorrectLanguage",
          "Yes, the presence or absence of a date in the asset has been reflected accurately in the YouTube copy.": "dateReflectedInYTCopy",
          "Yes, the final copy has been confirmed and added to the post using the YouTube Copy Text Optimizer.": "finalCopyAddedViaCopyOptimizer",
          "Yes, the asset has been pushed to the correct campaign on Socialite as per instructions.": "assetPushedToCorrectCampaign",
          "Yes, geo-fencing has been applied correctly. South Korea and North Korea have been geo-blocked proactively for Korean pre-buy debuts.": "geoFencingAppliedCorrectly",
          "Yes, the Notes section has been read thoroughly and all points addressed in the post.": "notesSectionReadAddressed",
          "Copy & CTA ➡️ Yes, for Netflix Korea and Korea/K-Content assets, CTAs were cross-checked with NTV for both pre- and post-assets. The relevant dates were verified as present in the asset and accurately reflected in the post copy, pinned comment (where applicable), description, and calendar invite.": "ctasCrossCheckedWithNTV",
          "Schedule→➡️ Yes, confirming that the Socialite post publish date and time were reviewed against the Project Earliest Date and Time listed in Socialite. The post is getting published at the same time as, or later than, the Project Earliest Date and Time. (Note: The Project level Earliest Post Date and Time must always be the same as, or earlier than, the Socialite post publish date and time.)": "publishDateReviewedAgainstEarliestDate",
          "End Screen Element Review ➡️ Yes, end screen elements were reviewed and updated in accordance with guidelines. For Korea and K-Content channels, the two most recent public videos from the same campaign were added. Private or unlisted videos are not included in the end screen elements.": "endScreenElementsReviewedUpdated",
          "Yes, for K-Content channels, SRTs (if provided) are checked for proper naming conventions and aligned with metadata.": "srtsCheckedForNamingConventions",
          "No need to flag for missing surnames or filler words in subtitles, as per current policy.": "noFlagForMissingSurnames",
          "Yes, any flags found were escalated in the appropriate Slack channel tagging the correct POCs.": "flagsEscalatedInSlack",
          "Yes, all inquiries regarding Saturday/Sunday posts were completed before Saturday at 11:00 a.m. (KST).": "satSunInquiriesCompletedBeforeDeadline",
          "Monday Board →  Yes, the task was moved to the \"In QC on Monday\" board with all relevant details, including the NPT link, NPT/YT scheduling screenshots, completed sub-items, QC notes, and all required supporting screenshots.": "taskMovedToInQCOnMonday",
          "Yes, for shorts, the calendar invite was sent 15 minutes prior to the scheduled publishing time. (Not applicable for FEEDs.)": "shortCalendarInviteSent15MinPrior",
          "Yes, content ID has been enabled for AVs on Netflix Korea and Netflix K-Content channels.": "contentIdEnabledForAVs",
          "Yes, the live link was updated on Socialite and the Socialite status was updated accordingly.": "liveLinkUpdatedOnSocialite",
          "Yes, the rejected asset has been corrected and resubmitted for QC.": "rejectedAssetCorrectedResubmitted",
          "Yes, the task was moved to the 'In QC on Monday' board.": "taskMovedToInQCBoard",
          "Live QC →  Yes, for Korea, K-Content, Japan, and Japan Anime channels, live QC is conducted by Leads/QM, and immediate QC email is shared with the QC team.": "liveQCConductedByLeads"
        };
        
        const apiCheckboxes = {};
        
        Object.entries(descriptiveToApiKeyMap).forEach(([descriptiveText, apiKey]) => {
          const generatedKey = generateCheckboxKey(descriptiveText);
          const value = checkboxData[generatedKey] || false;
          apiCheckboxes[apiKey] = value;
        });
        
        requestBody = {
          traffickerName: currentUser?.name || traffickerName,
          shift: shift,
          assignmentId: assignmentId,
          ticketId: qaReviewId,
          adTech: selectedTaskType.value,
          ...koreaKContentData,
          checkboxes: apiCheckboxes
        };
      } else if (selectedTaskType.value === 'YouTube') {
        if (selectedRequestType === 'Debut') {
          const assetReviewCheckboxes = {};
          const copyReviewCheckboxes = {};
          const thumbnailLocalizedCheckboxes = {};
          const nptPostingRestCheckboxes = {};
          
          const debutSections = dynamicSections?.Debut || [];
          
          debutSections.forEach(section => {
            const processType = section.process;
            section.items.forEach(item => {
              const key = item.replace(/[^a-zA-Z0-9]/g, '');
              const value = checkboxData[key] || false;
              
              if (processType === 'Asset Review') {
                assetReviewCheckboxes[key] = value;
              } else if (processType === 'Copy Review') {
                copyReviewCheckboxes[key] = value;
              } else if (processType === 'Thumbnail versions & Localized versions') {
                thumbnailLocalizedCheckboxes[key] = value;
              } else if (processType === 'NPT Posting & Rest') {
                nptPostingRestCheckboxes[key] = value;
              }
            });
          });
          
          requestBody = {
            traffickerName: currentUser?.name || traffickerName,
            shift: shift,
            assignmentId: assignmentId,
            adTech: selectedTaskType.value,
            requestType: selectedRequestType,
            process: formData.process,
            socialiteLink: formData.socialiteLink || '',
            mondayLink: formData.mondayLink || '',
            youtubeChannel: formData.youtubeChannel || '',
            assetReviewCheckboxes,
            copyReviewCheckboxes,
            thumbnailLocalizedCheckboxes,
            nptPostingRestCheckboxes,
            ticketId: qaReviewId
          };
        } else if (selectedRequestType === 'Non Debut') {
          const nonDebutCheckboxes = {};
          const nonDebutSections = dynamicSections['Non Debut'] || [];
          
          nonDebutSections.forEach(section => {
            section.items.forEach(item => {
              const key = item.replace(/[^a-zA-Z0-9]/g, '');
              nonDebutCheckboxes[key] = checkboxData[key] || false;
            });
          });
          
          requestBody = {
            traffickerName: currentUser?.name || traffickerName,
            shift: shift,
            assignmentId: assignmentId,
            adTech: selectedTaskType.value,
            requestType: selectedRequestType,
            socialiteLink: formData.socialiteLink || '',
            mondayLink: formData.mondayLink || '',
            youtubeChannel: formData.youtubeChannel || '',
            finalCommsCheckedBy: formData.finalCommsCheckedBy || '',
            liveQCDoneBy: formData.liveQCDoneBy || '',
            nonDebutCheckboxes,
            ticketId: qaReviewId
          };
        } else {
          const otherCheckboxes = {};
          const otherSections = dynamicSections[selectedRequestType] || [];
          
          otherSections.forEach(section => {
            section.items.forEach(item => {
              const key = item.replace(/[^a-zA-Z0-9]/g, '');
              otherCheckboxes[key] = checkboxData[key] || false;
            });
          });
          
          requestBody = {
            traffickerName: currentUser?.name || traffickerName,
            shift: shift,
            assignmentId: assignmentId,
            adTech: selectedTaskType.value,
            requestType: selectedRequestType,
            socialiteLink: formData.socialiteLink || '',
            mondayLink: formData.mondayLink || '',
            youtubeChannel: formData.youtubeChannel || '',
            finalCommsCheckedBy: formData.finalCommsCheckedBy || '',
            liveQCDoneBy: formData.liveQCDoneBy || '',
            checkboxes: otherCheckboxes,
            ticketId: qaReviewId
          };
        }
      } else if (selectedTaskType.value === 'PaidSocial') {
        const metaChecklist = {};
        const googleAdsChecklist = {};
        const tiktokChecklist = {};
        const snapchatChecklist = {};
        const redditChecklist = {};
        const twitterChecklist = {};
        const paidYTUnlistedChecklist = {};
        
        if (checkboxSections.length > 0) {
          const metaItems = checkboxSections[0]?.items || [];
          metaItems.forEach((item) => {
            const key = getCheckboxKey(item, 0);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) metaChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) metaChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) metaChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("correct title page")) metaChecklist.correctTitlePageSelected = value;
            else if (item.includes("media assets")) metaChecklist.mediaAssetsSelectedCorrectly = value;
            else if (item.includes("Primary Text, Headline, and Description")) metaChecklist.primaryTextHeadlineDescriptionAdded = value;
            else if (item.includes("appropriate Call-to-Action")) metaChecklist.appropriateCTASelected = value;
            else if (item.includes("Destination link (ODP)")) metaChecklist.odpLinkAddedAndTested = value;
            else if (item.includes("ad was saved successfully")) metaChecklist.adSavedSuccessfully = value;
            else if (item.includes("ad is currently OFF")) metaChecklist.adCurrentlyOffAfterTrafficking = value;
            else if (item.includes("Calendar invite was sent")) metaChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) metaChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) metaChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) metaChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) metaChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) metaChecklist.notApplicable = value;
          });
          
          const googleItems = checkboxSections[1]?.items || [];
          googleItems.forEach((item) => {
            const key = getCheckboxKey(item, 1);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) googleAdsChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were checked")) googleAdsChecklist.campaignAndAdSetChecked = value;
            else if (item.includes("YouTube video was added")) googleAdsChecklist.youtubeVideoAdded = value;
            else if (item.includes("correct ODP link was used")) googleAdsChecklist.correctODPLinkUsed = value;
            else if (item.includes("Display URL was added")) googleAdsChecklist.displayURLAdded = value;
            else if (item.includes("appropriate CTA was selected")) googleAdsChecklist.appropriateCTASelected = value;
            else if (item.includes("Title name was added in the Headline")) googleAdsChecklist.titleNameAdded = value;
            else if (item.includes("Companion Banner was selected")) googleAdsChecklist.companionBannerSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) googleAdsChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("ad was saved successfully")) googleAdsChecklist.adSavedSuccessfully = value;
            else if (item.includes("ad is currently OFF")) googleAdsChecklist.adCurrentlyOffAfterTrafficking = value;
            else if (item.includes("Calendar invite was sent")) googleAdsChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) googleAdsChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) googleAdsChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) googleAdsChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) googleAdsChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) googleAdsChecklist.notApplicable = value;
          });
          
          const tiktokItems = checkboxSections[2]?.items || [];
          tiktokItems.forEach((item) => {
            const key = getCheckboxKey(item, 2);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) tiktokChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) tiktokChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) tiktokChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("correct title page")) tiktokChecklist.correctTitlePageSelected = value;
            else if (item.includes("media (Thumbnail and Video) were selected")) tiktokChecklist.mediaSelectedCorrectly = value;
            else if (item.includes("text was added as per the Socialite tool")) tiktokChecklist.textAddedPerSocialite = value;
            else if (item.includes("appropriate CTA was selected")) tiktokChecklist.appropriateCTASelected = value;
            else if (item.includes("URL (ODP link) was added")) tiktokChecklist.odpLinkAddedAndVerified = value;
            else if (item.includes("Direct users to deeplink first")) tiktokChecklist.deeplinkCheckboxTicked = value;
            else if (item.includes("Unchecked authorization checkbox")) tiktokChecklist.authorizationCheckboxUnchecked = value;
            else if (item.includes("ad was saved successfully")) tiktokChecklist.adSavedSuccessfully = value;
            else if (item.includes("Calendar invite was sent")) tiktokChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) tiktokChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) tiktokChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) tiktokChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) tiktokChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) tiktokChecklist.notApplicable = value;
          });
          
          const snapchatItems = checkboxSections[3]?.items || [];
          snapchatItems.forEach((item) => {
            const key = getCheckboxKey(item, 3);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) snapchatChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) snapchatChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) snapchatChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("media (Thumbnail and Video) were selected")) snapchatChecklist.mediaSelectedCorrectly = value;
            else if (item.includes("public profile was selected as Netflix")) snapchatChecklist.publicProfileSelected = value;
            else if (item.includes("Title name was added in the Headline")) snapchatChecklist.titleAddedInHeadline = value;
            else if (item.includes("media was uploaded using the Upload option")) snapchatChecklist.mediaUploadedUsingUploadOption = value;
            else if (item.includes("Shareable & Ad Favoriting checkbox")) snapchatChecklist.shareableAndAdFavoritingEnabled = value;
            else if (item.includes("Status checkbox option was selected to keep the ad Paused")) snapchatChecklist.statusCheckboxSelectedPaused = value;
            else if (item.includes("Attachment was selected as Website")) snapchatChecklist.attachmentSelectedAsWebsite = value;
            else if (item.includes("appropriate CTA was selected")) snapchatChecklist.appropriateCTASelected = value;
            else if (item.includes("Status option was checked to pause the ad")) snapchatChecklist.statusOptionCheckedToPauseAd = value;
            else if (item.includes("ad was saved using Review & Publish")) snapchatChecklist.adSavedUsingReviewPublish = value;
            else if (item.includes("Calendar invite was sent")) snapchatChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) snapchatChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) snapchatChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) snapchatChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) snapchatChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) snapchatChecklist.notApplicable = value;
          });
          
          const redditItems = checkboxSections[4]?.items || [];
          redditItems.forEach((item) => {
            const key = getCheckboxKey(item, 4);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) redditChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) redditChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) redditChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("Creative Type")) redditChecklist.creativeTypeSelected = value;
            else if (item.includes("Headline (Description) was filled")) redditChecklist.headlineFilledUsingPSTTool = value;
            else if (item.includes("confirmation was taken from the requester")) redditChecklist.requesterConfirmationTaken = value;
            else if (item.includes("video was uploaded")) redditChecklist.videoUploadedCorrectly = value;
            else if (item.includes("appropriate Call to Action was selected")) redditChecklist.appropriateCTASelected = value;
            else if (item.includes("ad was saved and published")) redditChecklist.adSavedAndPublished = value;
            else if (item.includes("Calendar invite was sent")) redditChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) redditChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) redditChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) redditChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) redditChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) redditChecklist.notApplicable = value;
          });
          
          const twitterItems = checkboxSections[5]?.items || [];
          twitterItems.forEach((item) => {
            const key = getCheckboxKey(item, 5);
            const value = checkboxData[key] || false;
            if (item.includes("appropriate ad account was selected")) twitterChecklist.appropriateAdAccountSelected = value;
            else if (item.includes("campaign and ad set were selected")) twitterChecklist.campaignAndAdSetSelected = value;
            else if (item.includes("Creative and Media option was clicked")) twitterChecklist.creativeAndMediaClicked = value;
            else if (item.includes("media was uploaded using the Upload Media button")) twitterChecklist.mediaUploadedUsingUploadButton = value;
            else if (item.includes("copy was added from the PST tool")) twitterChecklist.copyAddedFromPSTTool = value;
            else if (item.includes("thumbnail was changed using the Edit Media option")) twitterChecklist.thumbnailChangedUsingEditMedia = value;
            else if (item.includes("appropriate Call to Action was selected")) twitterChecklist.appropriateCTASelected = value;
            else if (item.includes("Allow playback in embedded posts option was checked")) twitterChecklist.allowPlaybackChecked = value;
            else if (item.includes("Promoted only option was selected")) twitterChecklist.promotedOnlySelected = value;
            else if (item.includes("Post option was clicked to Tweet")) twitterChecklist.postOptionClickedToTweet = value;
            else if (item.includes("campaign and ad set were checked again")) twitterChecklist.campaignCheckedAgain = value;
            else if (item.includes("Edit Ad Group option was selected")) twitterChecklist.editAdGroupSelected = value;
            else if (item.includes("top left thread was clicked")) twitterChecklist.topLeftThreadSelected = value;
            else if (item.includes("Create Another Ad option was clicked")) twitterChecklist.createAnotherAdClicked = value;
            else if (item.includes("Use Existing Ad option was selected")) twitterChecklist.useExistingAdSelected = value;
            else if (item.includes("Ad name was created using the Taxonomy")) twitterChecklist.adNameCreatedUsingTaxonomy = value;
            else if (item.includes("Next button was clicked to publish the ad")) twitterChecklist.nextButtonClicked = value;
            else if (item.includes("Calendar invite was sent")) twitterChecklist.calendarInviteSent = value;
            else if (item.includes("preview links were added")) twitterChecklist.previewLinksAdded = value;
            else if (item.includes("asset has been reviewed")) twitterChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("approved copy is used")) twitterChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) twitterChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) twitterChecklist.notApplicable = value;
          });
          
          const paidYTUnlistedItems = checkboxSections[6]?.items || [];
          paidYTUnlistedItems.forEach((item) => {
            const key = getCheckboxKey(item, 6);
            const value = checkboxData[key] || false;
            if (item.includes("notes or special instructions were checked")) paidYTUnlistedChecklist.notesCheckedAcrossTools = value;
            else if (item.includes("asset was reviewed according to the checklist")) paidYTUnlistedChecklist.assetReviewedPerChecklist = value;
            else if (item.includes("in-burnt subtitles were checked")) paidYTUnlistedChecklist.inBurntSubtitlesChecked = value;
            else if (item.includes("title and description were prepared")) paidYTUnlistedChecklist.titleAndDescriptionPrepared = value;
            else if (item.includes("thumbnail was taken from PST/Socialite")) paidYTUnlistedChecklist.thumbnailVerified = value;
            else if (item.includes("Official Trailer 16x9 Clean thumbnail has been used")) paidYTUnlistedChecklist.officialTrailerThumbnailUsed = value;
            else if (item.includes("final YouTube copy was added")) paidYTUnlistedChecklist.finalYoutubeCopyAdded = value;
            else if (item.includes("assets are pushed to the correct NPT Campaign")) paidYTUnlistedChecklist.assetsPushedToCorrectCampaign = value;
            else if (item.includes("posts are made Unlisted ASAP")) paidYTUnlistedChecklist.postsMadeUnlistedASAP = value;
            else if (item.includes("YT Unlisted links are added to PST/Socialite")) paidYTUnlistedChecklist.ytLinksAddedToPST = value;
            else if (item.includes("necessary details are updated in the PST/Socialite")) paidYTUnlistedChecklist.necessaryDetailsUpdated = value;
            else if (item.includes("final communications were sent")) paidYTUnlistedChecklist.finalCommunicationsSent = value;
            else if (item.includes("details are added to Global QC Base")) paidYTUnlistedChecklist.detailsAddedToGlobalQCBase = value;
            else if (item.includes("posts are sent to QC by Informing in the Slack")) paidYTUnlistedChecklist.postsSentToQC = value;
            else if (item.includes("handoff has been shared to QM")) paidYTUnlistedChecklist.handoffSharedToQM = value;
            else if (item.includes("asset has been reviewed in line with the checklist") && !item.includes("according to the checklist")) paidYTUnlistedChecklist.assetReviewedAgain = value;
            else if (item.includes("approved copy is used")) paidYTUnlistedChecklist.approvedCopyUsed = value;
            else if (item.includes("rejected asset has been corrected")) paidYTUnlistedChecklist.rejectedAssetCorrected = value;
            else if (item.includes("NA (Not Applicable)")) paidYTUnlistedChecklist.notApplicable = value;
          });
        }
        
        requestBody = {
          traffickerName: currentUser?.name || traffickerName,
          shift: shift,
          assignmentId: assignmentId,
          ticketId: qaReviewId,
          adTech: selectedTaskType.value,
          atLink: formData.atLink || '',
          slackLink: formData.slackLink || '',
          ytLink: formData.ytLink || '',
          metaChecklist,
          googleAdsChecklist,
          tiktokChecklist,
          snapchatChecklist,
          redditChecklist,
          twitterChecklist,
          paidYTUnlistedChecklist
        };
      } else if (selectedTaskType.value === 'SocialMedia') {
        const twoStepVerificationCode = {};
        const accessRequest = {};
        const accessRemoveTakedown = {};
        const pageCreation = {};
        
        if (checkboxSections.length > 0) {
          const twoStepItems = checkboxSections[0]?.items || [];
          twoStepItems.forEach((item) => {
            const key = getCheckboxKey(item, 0);
            const value = checkboxData[key] || false;
            if (item.includes("DMed the code to the user")) twoStepVerificationCode.dmedCodeToUser = value;
            else if (item.includes("updated the Monday board and UT sheet")) twoStepVerificationCode.updatedMondayBoardAndUTSheet = value;
            else if (item.includes("NA")) twoStepVerificationCode.notApplicable = value;
          });
          
          const accessRequestItems = checkboxSections[1]?.items || [];
          accessRequestItems.forEach((item) => {
            const key = getCheckboxKey(item, 1);
            const value = checkboxData[key] || false;
            if (item.includes("Full-Time Employee access provided")) accessRequest.fullTimeEmployeeAccessProvided = value;
            else if (item.includes("Agency, checked the duration")) accessRequest.agencyAccessProvided = value;
            else if (item.includes("if duration provided, sent the calendar invite")) accessRequest.calendarInviteSentIfDurationProvided = value;
            else if (item.includes("NA")) accessRequest.notApplicable = value;
          });
          
          const accessRemoveItems = checkboxSections[2]?.items || [];
          accessRemoveItems.forEach((item) => {
            const key = getCheckboxKey(item, 2);
            const value = checkboxData[key] || false;
            if (item.includes("removed the access from the platform")) accessRemoveTakedown.accessRemovedFromPlatform = value;
            else if (item.includes("informed the user")) accessRemoveTakedown.informedUser = value;
            else if (item.includes("updated the Monday board and UT sheet")) accessRemoveTakedown.updatedMondayBoardAndUTSheet = value;
            else if (item.includes("NA")) accessRemoveTakedown.notApplicable = value;
          });
          
          const pageCreationItems = checkboxSections[3]?.items || [];
          pageCreationItems.forEach((item) => {
            const key = getCheckboxKey(item, 3);
            const value = checkboxData[key] || false;
            if (item.includes("created the page")) pageCreation.pageCreated = value;
            else if (item.includes("added the details for Instagram/Twitter/TikTok/Snapchat in 1P")) pageCreation.detailsAddedInIP = value;
            else if (item.includes("updated Airtable and Sprinklr")) pageCreation.updatedAirtableAndSprinklr = value;
            else if (item.includes("informed the requester")) pageCreation.informedRequester = value;
            else if (item.includes("updated the Monday board and UT sheet")) pageCreation.updatedMondayBoardAndUTSheet = value;
            else if (item.includes("NA")) pageCreation.notApplicable = value;
          });
        }
        
        requestBody = {
          traffickerName: currentUser?.name || traffickerName,
          shift: shift,
          assignmentId: assignmentId,
          adTech: selectedTaskType.value,
          ticketId: qaReviewId,
          ...formData,
          twoStepVerificationCode,
          accessRequest,
          accessRemoveTakedown,
          pageCreation
        };
      } else if (selectedTaskType.value === 'Socialite') {
        const apiCheckboxes = {};
        const socialiteCheckboxMapping = {
          "Yes, confirmed receipt via Socialite comment.": "confirmedReceiptViaSocialiteComment",
          "Yes, rescheduled the post in NPT.": "rescheduledPostInNPT",
          "Yes, confirming that the Socialite post publish date and time were reviewed against the Project Earliest Date and Time listed in Socialite. The post is getting published at the same time as, or later than, the Project Earliest Date and Time.": "publishDateReviewedAgainstEarliestDate",
          "Yes, added a comment in the Debut sheet notes": "addedCommentInDebutSheetNotes",
          "Yes, created a comment in the Debut sheet.": "createdCommentInDebutSheet",
          "Yes, confirmed back to Social Marketing": "confirmedBackToSocialMarketing",
          "Yes, removed the channel from the original post (if the post is no longer required).": "removedChannelFromOriginalPost",
          "Yes, created a new Socialite post (if needed).": "createdNewSocialitePost",
          "Yes, checked if the debut is showing properly in all channels after making the post public.": "checkedDebutShowingProperly"
        };
        
        Object.entries(socialiteCheckboxMapping).forEach(([descriptiveText, apiKey]) => {
          const key = descriptiveText.replace(/[^a-zA-Z0-9]/g, '');
          const value = checkboxData[key] || false;
          apiCheckboxes[apiKey] = value;
        });
        
        requestBody = {
          traffickerName: currentUser?.name || traffickerName,
          shift: shift,
          assignmentId: assignmentId,
          adTech: selectedTaskType.value,
          ticketId: qaReviewId,
          ...formData,
          checkboxes: apiCheckboxes
        };
      } else {
        requestBody = {
          traffickerName: currentUser?.name || traffickerName,
          shift: shift,
          assignmentId: assignmentId,
          ticketId: qaReviewId,
          adTech: selectedTaskType.value,
          ...formData,
          checkboxes: checkboxData
        };
      }
      
      console.log('Request Body:', requestBody);
      
      // Final save to backend before submission
      await autoSaveToBackend();
      
      const response = await fetchData(
        'PUT',
        'checklists/submit',
        requestBody
      );
      
      if (response && (response.success === true || response.status === 'success')) {
        clearLocalStorage();
        
        Swal.fire({
          icon: 'success',
          title: 'Submitted Successfully',
          text: 'Checklist has been submitted successfully!',
          timer: 2000,
          showConfirmButton: false,
          background: '#1a1a1a',
          color: '#e5e5e5'
        });
        
      } else {
        throw new Error(response?.message || response?.error || 'Submission failed');
      }
      
    } catch (error) {
      console.error('Error submitting checklist:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.message || 'Failed to submit checklist. Please try again.',
        background: '#1a1a1a',
        color: '#e5e5e5',
        confirmButtonColor: '#e50914'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskTypeChange = async (taskType) => {
    setSelectedTaskType(taskType);
    setFormData({});
    setCheckboxData({});
    setSelectedRequestType('');
    await fetchChecklistItemsFromLocal(taskType.value);
  };

const renderField = (item) => {
  const value = formData[item.key] !== undefined ? formData[item.key] : '';
  
  switch (item.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(item.key, e.target.value)}
          style={styles.input}
          placeholder={`Enter ${item.label}...`}
          required={item.required}
          data-field-key={item.key}
          data-field-label={item.label}
        />
      );
      
    case 'select':
      if (!item.options || item.options.length === 0) {
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(item.key, e.target.value)}
            style={styles.select}
            disabled
            required={item.required}
            data-field-key={item.key}
            data-field-label={item.label}
          >
            <option value="">No options available</option>
          </select>
        );
      }
      
      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(item.key, e.target.value)}
          style={styles.select}
          required={item.required}
          data-field-key={item.key}
          data-field-label={item.label}
        >
          <option value="">Select an option...</option>
          {item.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
      
    default:
      return null;
  }
};

  // Render checkboxes based on structure
  const renderCheckboxes = () => {
    if (dynamicSections && selectedTaskType?.value === 'YouTube') {
      const requestTypeOptions = [
        'Debut', 'Non Debut', 'TUDUM', 'Geeked Week', 'SAG', 'NoN', 'Channel Operations'
      ];
      
      const selectedProcess = formData.process;
      let sectionsToShow = [];
      
      if (selectedRequestType === 'Debut') {
        const allDebutSections = dynamicSections.Debut;
        if (selectedProcess) {
          sectionsToShow = allDebutSections.filter(
            section => section.process === selectedProcess
          );
        } else {
          sectionsToShow = [];
        }
      } else if (selectedRequestType === 'Non Debut' || 
                 selectedRequestType === 'TUDUM' || 
                 selectedRequestType === 'Geeked Week' || 
                 selectedRequestType === 'SAG' || 
                 selectedRequestType === 'NoN' ||
                selectedRequestType === 'Channel Operations') {
        sectionsToShow = dynamicSections['Non Debut'] || [];
      } 
      
      return (
        <>
          <div style={styles.section}>
            <h4 style={styles.subsectionTitle}>Request Type</h4>
            <div style={styles.radioGroup}>
              {requestTypeOptions.map(type => (
                <label key={type} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="requestType"
                    value={type}
                    checked={selectedRequestType === type}
                    onChange={() => handleRequestTypeChange(type)}
                    style={styles.radioInput}
                  />
                  <span style={styles.radioText}>{type}</span>
                </label>
              ))}
            </div>
          </div>
          
      {selectedRequestType === 'Debut' && (
  <div style={styles.section}>
    <h4 style={styles.subsectionTitle}>Process *</h4>
    <div style={styles.processGroup}>
      <label style={styles.radioLabel}>
        <input
          type="radio"
          name="process"
          value="Asset Review"
          checked={formData.process === 'Asset Review'}
          onChange={(e) => handleInputChange('process', e.target.value)}
          style={styles.radioInput}
          data-field-key="process"
          data-field-label="Process - Asset Review"
        />
        <span style={styles.radioText}>Asset Review</span>
      </label>
      <label style={styles.radioLabel}>
        <input
          type="radio"
          name="process"
          value="Copy Review"
          checked={formData.process === 'Copy Review'}
          onChange={(e) => handleInputChange('process', e.target.value)}
          style={styles.radioInput}
          data-field-key="process"
          data-field-label="Process - Copy Review"
        />
        <span style={styles.radioText}>Copy Review</span>
      </label>
      <label style={styles.radioLabel}>
        <input
          type="radio"
          name="process"
          value="Thumbnail versions & Localized versions"
          checked={formData.process === 'Thumbnail versions & Localized versions'}
          onChange={(e) => handleInputChange('process', e.target.value)}
          style={styles.radioInput}
          data-field-key="process"
          data-field-label="Process - Thumbnail versions & Localized versions"
        />
        <span style={styles.radioText}>Thumbnail versions & Localized versions</span>
      </label>
      <label style={styles.radioLabel}>
        <input
          type="radio"
          name="process"
          value="NPT Posting & Rest"
          checked={formData.process === 'NPT Posting & Rest'}
          onChange={(e) => handleInputChange('process', e.target.value)}
          style={styles.radioInput}
          data-field-key="process"
          data-field-label="Process - NPT Posting & Rest"
        />
        <span style={styles.radioText}>NPT Posting & Rest</span>
      </label>
    </div>
  </div>
)}
          
          {selectedRequestType === 'Debut' && !selectedProcess && (
            <div style={styles.warningMessage}>
              ⚠️ Please select a Process to view the relevant checklist
            </div>
          )}
          
          {selectedRequestType === 'Debut' && selectedProcess && sectionsToShow.length === 0 && (
            <div style={styles.warningMessage}>
              ⚠️ No checklist found for process: {selectedProcess}
            </div>
          )}
          
          {selectedRequestType && sectionsToShow && sectionsToShow.map((section, idx) => (
            <div key={idx} style={styles.section}>
              <h4 style={styles.subsectionTitle}>{section.sectionTitle}</h4>
              <div style={styles.checkboxGroup}>
                {section.items.map((item, itemIdx) => {
                  const key = item.replace(/[^a-zA-Z0-9]/g, '');
                  return (
                    <label key={itemIdx} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={checkboxData[key] || false}
                        onChange={(e) => handleCheckboxChange(key, e.target.checked)}
                        style={styles.checkbox}
                      />
                      <span style={styles.checkboxText}>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          
          {selectedRequestType && selectedRequestType !== 'Debut'  && (
            <div style={styles.section}>
              <h4 style={styles.subsectionTitle}>QC Sign-off</h4>
              
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Final Comms checked by? *
                  <span style={styles.fieldHint}> - NA - Please mention if not applicable - Self - Please mentioned if it did by own</span>
                </label>
                <select
                  value={formData.finalCommsCheckedBy || ''}
                  onChange={(e) => handleInputChange('finalCommsCheckedBy', e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Select an option...</option>
                  <option value="NA">NA - Not Applicable</option>
                  <option value="Self">Self - Did by own</option>
                </select>
              </div>
              
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Live QC done by? *
                  <span style={styles.fieldHint}> - NA - Please mention if not applicable - Self - Please mentioned if it didn't do by own</span>
                </label>
                <select
                  value={formData.liveQCDoneBy || ''}
                  onChange={(e) => handleInputChange('liveQCDoneBy', e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Select an option...</option>
                  <option value="NA">NA - Not Applicable</option>
                  <option value="Self">Self - Did by own</option>
                </select>
              </div>
            </div>
          )}
        </>
      );
    }
    
    if (checkboxSections.length > 0) {
      return checkboxSections.map((section, idx) => (
        <div key={idx} style={styles.section}>
          <h4 style={styles.subsectionTitle}>{section.sectionTitle}</h4>
          <div style={styles.checkboxGroup}>
            {section.items.map((item, itemIdx) => {
              const key = getCheckboxKey(item, idx);
              return (
                <label key={itemIdx} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={checkboxData[key] || false}
                    onChange={(e) => handleCheckboxChange(key, e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      ));
    }
    
    if (checkboxGroupItems.length > 0) {
      return (
        <div style={styles.section}>
          <h4 style={styles.subsectionTitle}>{checkboxGroupTitle}</h4>
          <div style={styles.checkboxGroup}>
            {checkboxGroupItems.map((item, index) => {
              const key = item.replace(/[^a-zA-Z0-9]/g, '');
              return (
                <label key={index} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={checkboxData[key] || false}
                    onChange={(e) => handleCheckboxChange(key, e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (loadingChecklist && !taskTypes.length) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading checklist...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Agent Checklist</h2>
        <button onClick={onClose || (() => window.close())} style={styles.closeButton}>×</button>
      </div>
      
      <div style={styles.taskTypeSection}>
        <h3 style={styles.sectionTitle}>Agent Information</h3>
        <div style={styles.infoFields}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Agent Name *</label>
            <input
              type="text"
              value={currentUser?.name || traffickerName}
              style={{...styles.input, ...styles.disabledInput}}
              placeholder="Enter your name..."
              required
              readOnly
              disabled
            />
          </div>
        </div>
      </div>
      
      <div style={styles.taskTypeSection}>
        <h3 style={styles.sectionTitle}>Select Task Type</h3>
        {taskTypes.length === 0 ? (
          <p style={{ color: '#757575' }}>No task types available</p>
        ) : (
          <div style={styles.radioGroup}>
            {taskTypes.map((taskType, index) => (
              <label key={index} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="taskType"
                  value={taskType.value}
                  checked={selectedTaskType?.value === taskType.value}
                  onChange={() => handleTaskTypeChange(taskType)}
                  style={styles.radioInput}
                />
                <span style={styles.radioText}>{taskType.displayName}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      
      {selectedTaskType && (
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>
            {selectedTaskType.displayName} Checklist
          </h3>
          
          {loadingChecklist ? (
            <div style={styles.loadingSmall}>
              <div style={styles.spinnerSmall}></div>
              <p>Loading checklist items...</p>
            </div>
          ) : (
            <>
              <div style={styles.fieldsContainer}>
                {checklistItems.length > 0 && (
                  <div style={styles.section}>
                    <h4 style={styles.subsectionTitle}>Form Fields</h4>
                    {checklistItems.map((item, index) => (
                      <div key={index} style={styles.fieldGroup}>
                        <label style={styles.label}>
                          {item.label}
                          {item.required && <span style={styles.requiredStar}>*</span>}
                        </label>
                        {renderField(item)}
                      </div>
                    ))}
                  </div>
                )}
                
                {renderCheckboxes()}
                
                {checklistItems.length === 0 && !checkboxGroupItems.length && !checkboxSections.length && !dynamicSections && (
                  <p style={{ color: '#757575', textAlign: 'center' }}>
                    No checklist items available for this task type
                  </p>
                )}
              </div>
              
              {(checklistItems.length > 0 || checkboxGroupItems.length > 0 || checkboxSections.length > 0 || dynamicSections) && (
                <div style={styles.buttonContainer}>
                  <button
                    onClick={submitChecklist}
                    style={styles.submitButton}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Checklist'}
                  </button>
                </div>
              )}
              
              <div style={styles.autoSaveIndicator}>
                <small>✏️ Auto-saving in progress...</small>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#141414',
    color: '#ffffff',
    fontFamily: "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif",
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    background: '#1a1a1a',
    borderBottom: '1px solid #404040',
    marginBottom: '20px',
    borderRadius: '8px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#e50914'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#757575',
    transition: 'color 0.2s',
    ':hover': {
      color: '#e50914'
    }
  },
  taskTypeSection: {
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '24px 32px',
    margin: '0 32px 24px 32px',
    border: '1px solid #404040'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#e5e5e5'
  },
  infoFields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '10px 16px',
    background: '#2a2a2a',
    borderRadius: '8px',
    transition: 'all 0.2s',
    border: '1px solid #404040'
  },
  radioInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#e50914'
  },
  radioText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e5e5e5'
  },
  formContainer: {
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '32px',
    margin: '0 32px 32px 32px',
    border: '1px solid #404040'
  },
  formTitle: {
    margin: '0 0 24px 0',
    fontSize: '20px',
    fontWeight: '600',
    paddingBottom: '12px',
    borderBottom: '2px solid #e50914',
    display: 'inline-block'
  },
  fieldsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  section: {
    marginBottom: '16px'
  },
  subsectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#e50914',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e50914',
    backgroundColor: '#2a2a2a',
    padding: '10px 15px',
    borderRadius: '6px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e5e5'
  },
  requiredStar: {
    color: '#e50914',
    marginLeft: '4px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #404040',
    background: '#2a2a2a',
    color: '#e5e5e5',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  disabledInput: {
    background: '#1a1a1a',
    color: '#757575',
    borderColor: '#333333',
    opacity: 0.7
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #404040',
    background: '#2a2a2a',
    color: '#e5e5e5',
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none'
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '4px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background 0.2s'
  },
  checkboxText: {
    fontSize: '13px',
    color: '#e5e5e5',
    lineHeight: '1.4',
    flex: 1
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#e50914',
    marginTop: '2px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#141414',
    color: '#ffffff'
  },
  loadingSmall: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #404040',
    borderTopColor: '#e50914',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  spinnerSmall: {
    width: '30px',
    height: '30px',
    border: '3px solid #404040',
    borderTopColor: '#e50914',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #404040',
    justifyContent: 'center'
  },
  submitButton: {
    padding: '12px 32px',
    background: '#e50914',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      background: '#f40612'
    }
  },
  autoSaveIndicator: {
    marginTop: '16px',
    padding: '8px 16px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#4caf50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: '4px',
    border: '1px solid rgba(76, 175, 80, 0.3)'
  },
  processGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px'
  },
  warningMessage: {
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    border: '1px solid #ff9800',
    borderRadius: '8px',
    color: '#ff9800',
    marginBottom: '16px',
    fontSize: '14px'
  },
  fieldHint: {
    fontSize: '11px',
    color: '#757575',
    marginLeft: '8px',
    fontWeight: 'normal'
  }
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AgentChecklist;