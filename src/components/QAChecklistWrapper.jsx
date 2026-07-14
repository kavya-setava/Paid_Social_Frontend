import React from 'react';
import { useParams } from 'react-router-dom';
import QAChecklist from './QAChecklist';
const QAChecklistWrapper = () => {
  const { qaReviewId } = useParams();
  return <QAChecklist qaReviewId={qaReviewId} />;
};

export default QAChecklistWrapper;