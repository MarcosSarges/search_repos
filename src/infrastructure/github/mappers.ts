import type { Issue, IssueLabel, Repo } from '@/domain';

import type { GithubIssueDto, GithubLabelDto, GithubRepoDto } from './types';

function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value == null ? undefined : value;
}

export function mapGithubRepo(dto: GithubRepoDto): Repo {
  return {
    id: dto.full_name,
    name: dto.name,
    fullName: dto.full_name,
    description: nullToUndefined(dto.description),
    stars: dto.stargazers_count,
    forks: dto.forks_count,
    watchers: dto.watchers_count ?? 0,
    language: nullToUndefined(dto.language),
    ownerName: dto.owner.login,
    ownerAvatarUrl: nullToUndefined(dto.owner.avatar_url),
    htmlUrl: dto.html_url,
  };
}

function mapGithubLabel(dto: GithubLabelDto): IssueLabel {
  return {
    id: String(dto.id),
    name: dto.name,
    color: nullToUndefined(dto.color),
  };
}

export function mapGithubIssue(dto: GithubIssueDto): Issue {
  return {
    id: String(dto.id),
    number: dto.number,
    title: dto.title,
    authorName: dto.user?.login ?? '',
    authorAvatarUrl: nullToUndefined(dto.user?.avatar_url),
    labels: (dto.labels ?? []).map(mapGithubLabel),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    state: dto.state,
    comments: dto.comments,
    htmlUrl: dto.html_url,
  };
}
