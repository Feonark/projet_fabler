<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Entity\Character;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class CharacterVoter extends Voter
{
  public const EDIT = 'CHARACTER_EDIT';
  public const VIEW = 'CHARACTER_VIEW';
  public const DELETE = 'CHARACTER_DELETE';

  protected function supports(string $attribute, mixed $subject): bool
  {
    return in_array($attribute, [self::EDIT, self::VIEW, self::DELETE])
      && $subject instanceof Character;
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

    // Sinon, on vérifie que l'utilisateur agit sur son propre character
    switch ($attribute) {
      case self::EDIT:
      case self::VIEW:
      case self::DELETE:
        return $subject->getOwner() === $user;
    }

    return false;
  }
}
