/**
 * StoryGame.jsx
 * -------------
 * The interactive story reader.  Given a fully-loaded story object, this
 * component manages which node the reader is currently viewing and renders
 * either the available choices or the appropriate ending screen.
 *
 * The story is modelled as a directed graph where each node has:
 *   • `content`      – the narrative text for that beat
 *   • `options`      – array of { text, node_id } choices leading to child nodes
 *   • `is_ending`    – boolean; true means no options are shown
 *   • `is_winning_endig` – boolean (note: intentional typo from backend model)
 *
 * All nodes are stored flat in `story.all_nodes` keyed by their ID, so
 * navigating between beats is just an O(1) lookup — no additional fetches
 * are needed once the story is loaded.
 *
 * Props:
 *   story     {Object}   – Complete story object from the backend
 *   onNewStory {Function} – Called when the user wants to start fresh;
 *                           navigates back to the generator (optional)
 *
 * Styling: classes live in the "/* StoryGame *\/" section of App.css.
 */

import { useState, useEffect } from 'react';

/**
 * StoryGame
 *
 * Two `useEffect` hooks drive the state machine:
 *   1. When `story` changes → set `currentNodeId` to the root node
 *   2. When `currentNodeId` changes → look up the node in `all_nodes` and
 *      derive the display state (content, options, ending flags)
 *
 * Keeping these separate makes it easy to restart (just reset currentNodeId)
 * and to handle edge cases like a missing node ID gracefully.
 *
 * @param {Object}    props
 * @param {Object}    props.story       - Full story object with all_nodes map
 * @param {Function}  [props.onNewStory] - Optional callback to create a new story
 * @returns {JSX.Element} Interactive story reader card
 */
function StoryGame({ story, onNewStory }) {
  // currentNodeId – the key used to look up the active beat in all_nodes
  const [currentNodeId, setCurrentNodeId] = useState(null);
  // currentNode – the full node object for the active beat
  const [currentNode, setCurrentNode] = useState(null);
  // options – array of { text, node_id } for the current beat's choices
  const [options, setOptions] = useState([]);
  // isEnding – hides the choices panel and shows the ending screen
  const [isEnding, setIsEnding] = useState(false);
  // isWinningEnding – selects between congratulations and neutral ending copy
  const [isWinningEnding, setIsWinningEnding] = useState(false);

  /**
   * Effect 1: Initialise navigation when a new story is loaded.
   * Sets currentNodeId to the root node so Effect 2 can render the first beat.
   */
  useEffect(() => {
    if (story && story.root_node) {
      setCurrentNodeId(story.root_node.id);
    }
  }, [story]);

  /**
   * Effect 2: Sync display state whenever the active node ID changes.
   * Looks up the node in the flat `all_nodes` map and derives all the flags
   * StoryGame needs to decide what to render.
   */
  useEffect(() => {
    if (currentNodeId && story && story.all_nodes) {
      const node = story.all_nodes[currentNodeId];

      setCurrentNode(node);
      setIsEnding(node.is_ending);
      // NOTE: backend typo — field is "is_winning_endig" (missing 'n')
      setIsWinningEnding(node.is_winning_endig);

      // Only populate options when the node is not a terminal node
      if (!node.is_ending && node.options && node.options.length > 0) {
        setOptions(node.options);
      } else {
        setOptions([]);
      }
    }
  }, [currentNodeId, story]);

  /**
   * chooseOption
   * Advances the story to the chosen child node.
   * Because all_nodes is a flat map, this is a pure state update — no fetch.
   *
   * @param {string} optionId - The node_id of the chosen option's destination
   */
  const chooseOption = (optionId) => {
    setCurrentNodeId(optionId);
  };

  /**
   * restartStory
   * Resets navigation back to the root node without reloading story data.
   * This is the local-state equivalent of refreshing the page.
   */
  const restartStory = () => {
    if (story && story.root_node) {
      setCurrentNodeId(story.root_node.id);
    }
  };

  return (
    <div className="story-game">
      {/* Story title bar */}
      <header className="story-header">
        <h2>{story.title}</h2>
      </header>

      <div className="story-content">
        {/* Only render the node once currentNode is resolved */}
        {currentNode && (
          <div className="story-node">
            {/* Narrative text for this beat */}
            <p>{currentNode.content}</p>

            {isEnding ? (
              /* ── Ending screen ─────────────────────────────────────── */
              <div className="story-ending">
                <h3>{isWinningEnding ? 'Congratulations!' : 'The End'}</h3>
                <p className={isWinningEnding ? 'winning-message' : 'ending-message'}>
                  {isWinningEnding
                    ? 'You reached a winning ending!'
                    : 'Your adventure has ended.'}
                </p>
                <button onClick={restartStory} className="restart-btn">
                  Play Again
                </button>
              </div>
            ) : (
              /* ── Choice panel ──────────────────────────────────────── */
              <div className="story-options">
                <h3>What will you do?</h3>
                <div className="options-list">
                  {options.map((option, index) => (
                    /* key uses index as a fallback; option.node_id would be
                       ideal but may collide if the same node appears twice */
                    <button
                      key={index}
                      onClick={() => chooseOption(option.node_id)}
                      className="option-btn"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Bottom controls ───────────────────────────────────────── */}
        <div className="story-controls">
          {/* Restart resets to root node without a network request */}
          <button onClick={restartStory} className="reset-btn">
            Restart Story
          </button>
        </div>

        {/* "New Story" is only shown when a callback was provided */}
        {onNewStory && (
          <button onClick={onNewStory} className="new-story-btn">
            New Story
          </button>
        )}
      </div>
    </div>
  );
}

export default StoryGame;
