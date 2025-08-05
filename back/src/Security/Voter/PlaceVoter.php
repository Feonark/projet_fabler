<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Entity\Place;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class PlaceVoter extends Voter
{
  public const CREATE = 'PLACE_CREATE';
  public const EDIT = 'PLACE_EDIT';
  public const DELETE = 'PLACE_DELETE';

  protected function supports(string $attribute, mixed $subject): bool
  {
    return in_array($attribute, [self::EDIT, self::DELETE, self::CREATE])
      && $subject instanceof Place;
  }

  protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
  {
    $user = $token->getUser();
    $story = $subject->getStory();

    if (!$user instanceof User) {
      return false;
    }

    // Si c'est un admin on autorise tout
    if (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
      return true;
    }

    switch ($attribute) {
      case self::CREATE:
      case self::DELETE:
      case self::EDIT:
        // Seulement l'auteur de la story peut CRUD
        return $story && $story->getAuthor() === $user;
    }

    return false;
  }
}
