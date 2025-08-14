<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Entity\Story;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class StoryVoter extends Voter
{
  public const VIEW = 'STORY_VIEW';
  public const EDIT = 'STORY_EDIT';
  public const DELETE = 'STORY_DELETE';

  protected function supports(string $attribute, mixed $subject): bool
  {
    return in_array($attribute, [self::EDIT, self::VIEW, self::DELETE])
      && $subject instanceof Story;
  }

  protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
  {
    $user = $token->getUser();

    // Si c'est un admin on autorise tout
    if ($user instanceof User && in_array('ROLE_ADMIN', $user->getRoles(), true)) {
      return true;
    }

    switch ($attribute) {
      case self::VIEW:
        // Si story publique * peut voir
        if ($subject->isPublic()) {
          return true;
        }

        // Si pas connecté, voit pas
        if (!$user instanceof User) {
          return false;
        }

        // Auteur, voit
        if ($subject->getAuthor() === $user) {
          return true;
        }

        // Membre, voit
        foreach ($subject->getMembers() as $member) {
          if ($member->getMemberUser() === $user) {
            return true;
          }
        }

      case self::EDIT:
      case self::DELETE:
        return $subject->getAuthor() === $user;
    }

    return false;
  }
}
