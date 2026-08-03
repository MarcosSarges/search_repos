import type { Issue, IssueLabel, Repo } from '@/domain';

import type { GitlabIssueDto, GitlabProjectDto } from './types';

function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value == null ? undefined : value;
}

function ownerNameFromProject(dto: GitlabProjectDto): string {
  if (dto.namespace?.name) {
    return dto.namespace.name;
  }
  const segment = dto.path_with_namespace.split('/')[0];
  return segment ?? '';
}

export function mapGitlabRepo(dto: GitlabProjectDto): Repo {
  return {
    id: String(dto.id),
    name: dto.name,
    fullName: dto.path_with_namespace,
    description: nullToUndefined(dto.description),
    stars: dto.star_count,
    forks: dto.forks_count,
    watchers: dto.watchers_count ?? 0,
    language: nullToUndefined(dto.language),
    ownerName: ownerNameFromProject(dto),
    ownerAvatarUrl: nullToUndefined(dto.namespace?.avatar_url),
    htmlUrl: dto.web_url,
  };
}

function mapGitlabLabel(name: string): IssueLabel {
  return {
    id: name,
    name,
    color: undefined,
  };
}

function mapGitlabIssueState(state: GitlabIssueDto['state']): Issue['state'] {
  return state === 'opened' ? 'open' : 'closed';
}

export function mapGitlabIssue(dto: GitlabIssueDto): Issue {
  return {
    id: String(dto.id),
    number: dto.iid,
    title: dto.title,
    authorName: dto.author?.username ?? '',
    authorAvatarUrl: nullToUndefined(dto.author?.avatar_url),
    labels: (dto.labels ?? []).map(mapGitlabLabel),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    state: mapGitlabIssueState(dto.state),
    comments: dto.user_notes_count,
    htmlUrl: dto.web_url,
  };
}
