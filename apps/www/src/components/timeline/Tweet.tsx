import { useMemo } from 'react';
import { enrichTweet, QuotedTweet, TweetBody, TweetContainer, TweetMedia } from 'react-tweet';
import type { Tweet as TweetData } from 'react-tweet/api';

/*
 * react-tweet's EmbeddedTweet, put together from its own parts, with only what the timeline
 * doesn't say already. Every tweet here is mine and the entry above it has the date, so the
 * avatar, name and time are gone, and so are the likes and replies. What's left is the text,
 * the pictures, a quoted tweet and X's logo, which links to the post.
 */

export function Tweet({ tweet: data }: { tweet: TweetData }) {
  const tweet = useMemo(() => enrichTweet(data), [data]);
  return (
    <TweetContainer>
      <a aria-label="View on X" className="tl-tweet-logo" href={tweet.url} rel="noopener noreferrer" target="_blank">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <TweetBody tweet={tweet} />
      {tweet.mediaDetails?.length ? <TweetMedia tweet={tweet} /> : null}
      {tweet.quoted_tweet ? <QuotedTweet tweet={tweet.quoted_tweet} /> : null}
    </TweetContainer>
  );
}
