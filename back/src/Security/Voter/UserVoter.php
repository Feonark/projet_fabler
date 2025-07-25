<?php

namespace App\Security\Voter;

use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class UserVoter extends Voter
{
    public const EDIT = 'POST_EDIT';
    public const VIEW = 'POST_VIEW';
    public const DELETE = 'POST_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        // replace with your own logic
        // https://symfony.com/doc/current/security/voters.html
        return in_array($attribute, [self::EDIT, self::VIEW, self::DELETE])
            && $subject instanceof \App\Entity\User;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        // if the user is anonymous, do not grant access
        if (!$user instanceof \App\Entity\User) {
            return false;
        }


        // Si c'est un admin on autorise tout
        if (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
            return true;
        }

        // Sinon, on vérifie que l'utilisateur agit sur son propre compte
        switch ($attribute) {
            case self::EDIT:
            case self::VIEW:
            case self::DELETE:
                return $subject->getId() === $user->getId();
        }

        return false;
    }
}
