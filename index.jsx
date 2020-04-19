import { styled, css } from 'uebersicht';

export const refreshFrequency = 1.8e6; // 30m

export const className = `
  left: 2em;
  top: 2em;
  font-family: -apple-system;
  z-index: 1;

  border: 0.125em solid #eee;
  border-radius: 0.25em;
  background-color: rgba(51, 51, 51, 0.5);
  padding: 1em;
`;

const PROXY = 'http://127.0.0.1:41417/';

const api = async query => await fetch (new URL(`${PROXY}https://hacker-news.firebaseio.com/v0/${query}`));

export const command = async dispatch => {
    const response = await api('topstories.json');
    if (!response.ok) {
      throw Error(`${response.status} ${response.statusText}`);
    }
    const storyIds = await response.json();
    const data = await Promise.all(
        storyIds.slice(0, 10).map(async id => {
            const itemResponse = await api(`item/${id}.json`);
            if (!itemResponse.ok) {
              throw Error(`${itemResponse.status} ${itemResponse.statusText}`);
            }
            return await itemResponse.json();
        })
    );
    dispatch({ type: 'FETCH_SUCCEEDED', data});
};

export const updateState = (event, previousState) => {
    switch (event.type) {
        case 'FETCH_SUCCEEDED': return { data: event.data };
        case 'FETCH_FAILED': return { error: event.error.message };
        default: return previousState;
    }
};

const TopStoriesList = styled.ul`
    list-style-type: none;
    line-height: 1.5rem;
    margin: 0;
    padding: 0;
`;

const a = css`
    color: #eee;
    padding: 0 0.5rem;
    text-decoration: none;
`;

const small = css`
    font-size: 0.8rem;
`;

const makeItemLink = id => `https://news.ycombinator.com/item?id=${id}`;

const StoryLink = ({ id, title, url}) => {
    const link = url ? url : makeItemLink(id);
    const host = ` (${(new URL(link)).hostname})`;
    return (
        <a className={a} href={link}>{`${title}${host}`}</a>
    );
};

const DiscussionLink = ({ id }) => (
    <span className={small}>
        <a className={a} href={makeItemLink(id)}>discuss</a>
    </span>
);

const TopStory = ({id, title, url}) => (
    <li>
        <StoryLink id={id} title={title} url={url} />
        <DiscussionLink id={id} />
    </li>
);

export const render = ({ data = [], error = '' }) => (
  error ? (
    <div>
      {`Error retrieving: ${error}`}
    </div>
  ) : (
    <TopStoriesList>
      {data.map((item) => <TopStory key={item.id} {...item} />)}
    </TopStoriesList>
  )
);
