import { IconButton } from '@hitel/ui/components/button';
import { REPO_URL } from '@/constants';

const LABEL = 'Forráskód a GitHubon';

export const GithubLink = () => {
  return (
    <IconButton
      aria-label={LABEL}
      tooltip={LABEL}
      nativeButton={false}
      render={<a href={REPO_URL} target='_blank' rel='noreferrer' />}
      icon={
        <img src={`${import.meta.env.BASE_URL}github.svg`} alt='' className='size-4 dark:invert' />
      }
    />
  );
};
