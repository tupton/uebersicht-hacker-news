import { styled, css } from 'uebersicht';

export const refreshFrequency = 1.8e6; // 30m

export const className = `
  left: 2rem;
  top: 2rem;
  color: white;
  font-family: -apple-system;
  z-index: 1;
`;

const PROXY = 'http://127.0.0.1:41417/';

async function api(query) {
    return await fetch (new URL(`${PROXY}https://hacker-news.firebaseio.com/v0/${query}`));
}

export const command = async dispatch => {
    const response = await api('topstories.json');
    if (!response.ok) {
      throw Error(`${response.status} ${response.statusText}`);
    }
    const storyIds = await response.json();
    const data = await Promise.all(
        storyIds.slice(0, 10).map(async id => {
            const itemResponse = await api(`item/${id}.json`);
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
`;

const a = css`
    color: #333;
    padding: 0 0.5rem;
    text-decoration: none;
`;

const StoryLink = ({ title, url}) => (
    <a className={a} href={url}>{`${title} (${new URL(url).hostname})`}</a>
);

const DiscussionLink = ({ id }) => (
    <a className={a} href={`https://news.ycombinator.com/item?id=${id}`}>&#128172;</a>
);

const TopStory = ({id, title, url}) => (
    <li>
        <StoryLink title={title} url={url} />
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
