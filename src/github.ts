// deno-lint-ignore-file camelcase

import { jsonrepair } from 'https://esm.sh/jsonrepair@3.1.0/';

import packs from './packs.ts';

import utils from './utils.ts';

import { Manifest } from './types.ts';

import { NonFetalError } from './errors.ts';

interface Owner {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface License {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
  node_id: string;
}

interface Repo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: Owner;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: Date;
  updated_at: Date;
  pushed_at: Date;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  mirror_url?: string;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: License;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics: string[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  temp_clone_token?: string;
  network_count: number;
  subscribers_count: number;
}

function resolve(url: string): { username: string; reponame: string } {
  // try username/repo
  let array = /^([-_a-zA-Z0-9]+)\/([-_a-zA-Z0-9]+)$/.exec(
    url,
  );

  if (!array) {
    array = /^https:\/\/github.com\/([^\/:]+)\/(.+)$/.exec(
      url,
    );
  }

  if (!array) {
    throw new NonFetalError(`\`${url}\` is not a valid GitHub URL`);
  }

  const username = array[1];
  let reponame = array[2];

  reponame = array[2].endsWith('.git')
    ? reponame.substring(0, reponame.length - 4)
    : reponame;

  reponame = array[2].endsWith('/')
    ? reponame.substring(0, reponame.length - 1)
    : reponame;

  return {
    username,
    reponame,
  };
}

async function get(url: string): Promise<Repo> {
  const { username, reponame } = resolve(url);

  const api = `https://api.github.com/repos/${username}/${reponame}`;

  const response = await fetch(api);

  if (!response.ok) {
    throw new NonFetalError(
      `**${response.status}** ${response.statusText}\nFailed to Fetch Repository.`,
    );
  }

  const json = await response.json();

  if (json.message) {
    throw new NonFetalError(json.message);
  }

  return json as Repo;
}

async function manifest(
  { id, url }: { id?: number; url?: string },
): Promise<{ id: number; manifest: Manifest }> {
  // deno-lint-ignore no-non-null-assertion
  id = id ?? (await get(url!.trim())).id;

  let entries: Awaited<ReturnType<typeof utils.unzip>>['entries'];

  try {
    entries = (await utils.unzip(
      `https://api.github.com/repositories/${id}/zipball`,
    )).entries;
  } catch (err) {
    if (err.message.includes('404: Not Found')) {
      throw new NonFetalError(
        `**404** Not Found\nFailed to Fetch Repository.`,
      );
    }

    throw err;
  }

  const manifests = Object.values(entries)
    .filter(({ name }) => name.endsWith('manifest.json'))
    .map((entry) => entry.text());

  const results = await Promise.all(manifests);

  if (!results.length) {
    throw new NonFetalError('No `manifest.json` found');
  }

  let manifest: Manifest;

  try {
    manifest = JSON.parse(results[0]);
  } catch {
    try {
      manifest = JSON.parse(jsonrepair(results[0]));
    } catch {
      // JSON can't be parsed
      throw new NonFetalError('`manifest.json` is not a JSON file');
    }
  }

  return {
    id,
    manifest: packs.populateRelations(manifest),
  };
}

const github = {
  get,
  manifest,
};

export default github;
