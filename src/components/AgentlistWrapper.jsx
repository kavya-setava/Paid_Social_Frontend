import React from 'react';
import { useParams } from 'react-router-dom';
import QAChecklist from './QAChecklist';
import AgentChecklist from './AgentChecklist';
const AgentChecklistWrapper = () => {
  const { assignmentId } = useParams();
  return <AgentChecklist assignmentId={assignmentId} />;
};

export default AgentChecklistWrapper;