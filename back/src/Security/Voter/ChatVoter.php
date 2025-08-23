<?php

namespace App\Security\Voter;

use App\Entity\Chat;
use App\Entity\User;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class ChatVoter extends Voter
{
  public const VIEW = 'CHAT_VIEW';
  public const EDIT = 'CHAT_EDIT';

  protected function supports(string $attribute, mixed $subject): bool
  {
    return in_array($attribute, [self::EDIT, self::VIEW])
      && $subject instanceof Chat;
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
      case self::EDIT:
        // On montre/édite si User
        if ($user instanceof User) {

          // Membre, voit/édite
          foreach ($subject->getMembers() as $member) {
            if ($member->getMemberUser()?->getId() === $user->getId() && $member->isAccepted()) {
              return true;
            }
          }
        }
        return false;
    }

    // Sinon rien
    return false;
  }
}
