// utils/allocationStateMachine.js
const STATES = {
    DRAFT: "draft",
    MERIT: "merit_generated",
    ELIGIBLE: "eligible_set",
    OPEN: "selection_open",
    CLOSED: "selection_closed",
    DONE: "completed"
  };
  
  const TRANSITIONS = {
    draft: ["merit_generated"],
    merit_generated: ["eligible_set"],
    eligible_set: ["selection_open"],
    selection_open: ["selection_closed"],
    selection_closed: ["completed"],
    completed: []
  };
  
  const canTransition = (from, to) => {
    return TRANSITIONS[from]?.includes(to);
  };
  
  module.exports = { STATES, canTransition };