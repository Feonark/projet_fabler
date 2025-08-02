<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Entity\Story;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class StoryVoter extends Voter
{
  public const EDIT = 'POST_EDIT';
  public const VIEW = 'POST_VIEW';
  public const DELETE = 'POST_DELETE';

  protected function supports(string $attribute, mixed $subject): bool
  {
    return in_array($attribute, [self::EDIT, self::VIEW, self::DELETE])
      && $subject instanceof Story;
  }

  protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
  {
    $user = $token->getUser();

    if (!$user instanceof User) {
      return false;
    }

    // Si c'est un admin on autorise tout
    if (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
      return true;
    }

    // Sinon, on vérifie que l'utilisateur agit sur sa propre story
    switch ($attribute) {
      case self::EDIT:
      case self::VIEW:
      case self::DELETE:
        return $subject->getAuthor() === $user;
    }

    return false;
  }
}
