<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Entity\StoryMember;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class StoryMemberVoter extends Voter
{
  public const CREATE = 'STORY_MEMBER_CREATE';
  public const EDIT = 'STORY_MEMBER_EDIT';
  public const DELETE = 'STORY_MEMBER_DELETE';

  protected function supports(string $attribute, mixed $subject): bool
  {
    return in_array($attribute, [self::EDIT, self::DELETE, self::CREATE])
      && $subject instanceof StoryMember;
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

    // Sinon, on vérifie que l'utilisateur agit sur sa propre storymembership
    switch ($attribute) {
      case self::CREATE:
        // Les utilisateurs connectés peuvent créer un storymember
        return true;

      case self::DELETE:
        // Un storymember peut se delete lui-même, un auteur peut le delete aussi
        return $subject->getMemberUser() === $user || ($story && $story->getAuthor() === $user);

      case self::EDIT:
        // Seulement l'auteur de la story peut edit 
        return $story && $story->getAuthor() === $user;
    }

    return false;
  }
}
