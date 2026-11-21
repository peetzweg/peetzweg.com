import { useMemo } from 'react';
import {
  enrichTweet,
  QuotedTweet,
  TweetActions,
  TweetBody,
  TweetContainer,
  TweetHeader,
  TweetInReplyTo,
  TweetMedia,
  TweetReplies,
} from 'react-tweet';
import type { Tweet as TweetData } from 'react-tweet/api';

/*
 * react-tweet's EmbeddedTweet, put together from its own parts, except for the line with the
 * time. react-tweet writes that in the time zone of whatever renders it: UTC on the server,
 * the visitor's own in the browser. The two texts differ, React throws the server's page away
 * and renders it again, and everything reveals twice. Here the time is always Berlin's.
 */

const TIME_ZONE = 'Europe/Berlin';

const format = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

/** As react-tweet writes it: `7:43 PM · Nov 20, 2026`. */
function formatTime(date: Date) {
  const parts = Object.fromEntries(format.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.hour}:${parts.minute} ${parts.dayPeriod} · ${parts.month} ${parts.day}, ${parts.year}`;
}

export function Tweet({ tweet: data }: { tweet: TweetData }) {
  const tweet = useMemo(() => enrichTweet(data), [data]);
  return (
    <TweetContainer>
      <TweetHeader tweet={tweet} />
      {tweet.in_reply_to_status_id_str ? <TweetInReplyTo tweet={tweet} /> : null}
      <TweetBody tweet={tweet} />
      {tweet.mediaDetails?.length ? <TweetMedia tweet={tweet} /> : null}
      {tweet.quoted_tweet ? <QuotedTweet tweet={tweet.quoted_tweet} /> : null}
      <TweetInfo created={tweet.created_at} url={tweet.url} />
      <TweetActions tweet={tweet} />
      <TweetReplies tweet={tweet} />
    </TweetContainer>
  );
}

/** react-tweet's TweetInfo, styled the same in timeline.css. */
function TweetInfo({ created, url }: { created: string; url: string }) {
  const date = new Date(created);
  const time = formatTime(date);
  return (
    <div className="tl-tweet-info">
      <a aria-label={time} className="tl-tweet-time" href={url} rel="noopener noreferrer" target="_blank">
        <time dateTime={date.toISOString()}>{time}</time>
      </a>
      <a
        aria-label="Twitter for Websites, Ads Information and Privacy"
        className="tl-tweet-about"
        href="https://help.x.com/en/x-for-websites-ads-info-and-privacy"
        rel="noopener noreferrer"
        target="_blank"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M13.5 8.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5S11.17 7 12 7s1.5.67 1.5 1.5zM13 17v-5h-2v5h2zm-1 5.25c5.66 0 10.25-4.59 10.25-10.25S17.66 1.75 12 1.75 1.75 6.34 1.75 12 6.34 22.25 12 22.25zM20.25 12c0 4.56-3.69 8.25-8.25 8.25S3.75 16.56 3.75 12 7.44 3.75 12 3.75s8.25 3.69 8.25 8.25z" />
        </svg>
      </a>
    </div>
  );
}
