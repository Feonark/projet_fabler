<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Entity\Message;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class MessageVoter extends Voter
{
  public const VIEW = 'MESSAGE_VIEW';
  public const CREATE = 'MESSAGE_CREATE';
  public const DELETE = 'MESSAGE_DELETE';

  protected function supports(string $attribute, mixed $subject): bool
  {
    return in_array($attribute, [self::DELETE, self::CREATE, self::VIEW])
      && $subject instanceof Message;
  }

  protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
  {
    $user = $token->getUser();

    if (!$user instanceof User) {
      return false;
    }

    // Admin = autorisé partout
    if (in_array('ROLE_ADMIN', $user->getRoles(), true)) {
      return true;
    }

    $userId = $user->getId();
    if ($userId === null) {
      return false;
    }

    $chat = $subject->getChat();
    $story = $chat?->getStory();
    $storyMember = $subject->getAuthor();

    switch ($attribute) {
      case self::VIEW:
        if (!$chat) {
          return false;
        }

        // Autorisé si l'utilisateur est membre accepté du chat
        $isMember = $chat->getMembers()->exists(
          fn($i, $member) =>
          $member->getMemberUser()?->getId() === $userId
            && (method_exists($member, 'isAccepted') ? $member->isAccepted() : true)
        );

        // Ou auteur de la story
        $isStoryAuthor = $story && $story->getAuthor()?->getId() === $userId;
        return $isMember || $isStoryAuthor;

      case self::CREATE:
        $character = $subject->getCharacterAlias();
        if ($character && $character->getOwner() !== $user) {
          return false; // interdit d'utiliser un personnage qui n'est pas à soi
        }

        // Auteur de la story ou membre de la story
        if ($story && $story->getAuthor() === $user) {
          return true;
        }

        if ($story) {
          return $story->getMembers()->exists(
            fn($i, $member) => $member->getMemberUser() === $user
          );
        }

        return false;

      case self::DELETE:
        // Auteur de la story OU auteur du message
        return ($storyMember && $storyMember->getMemberUser() === $user)
          || ($story && $story->getAuthor() === $user);
    }

    return false;
  }
}
