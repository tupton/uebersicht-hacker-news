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

export const render = ({ data = [], error = '' }) => (
  error ? (
    <div>
      {`Error retrieving: ${error}`}
    </div>
  ) : (
    <ul>
      {data.map(({ id, title, url}) => <li key={id}>{`${title} - ${url}`}</li>)}
    </ul>
  )
);
