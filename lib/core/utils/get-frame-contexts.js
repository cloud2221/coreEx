import Context from '../base/context';
import getAncestry from './get-ancestry';

export default function getFrameContexts(context) {
  const { frames } = new Context(context);
  return frames.map(({ node, ...frameContext }) => {
    frameContext.initiator = false;
    const frameSelector = getAncestry(node);
    return { frameSelector, frameContext };
  });
}
