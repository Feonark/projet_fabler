<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use Doctrine\ORM\QueryBuilder;
use ApiPlatform\Metadata\Operation;
use App\Entity\Message;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;

final class MessageQueryExtension implements QueryCollectionExtensionInterface
{
  public function __construct(private Security $security) {}

  public function applyToCollection(
    QueryBuilder $qb,
    QueryNameGeneratorInterface $gen,
    string $resourceClass,
    ?Operation $operation = null,
    array $context = []
  ): void {
    if ($resourceClass !== Message::class) {
      return;
    }

    $user = $this->security->getUser();
    if (!$user instanceof User) {
      // pas connecté => aucune ligne
      $qb->andWhere('1 = 0');
      return;
    }

    $root        = $qb->getRootAliases()[0];                 // alias de Message (ex: m)
    $chatAlias   = $gen->generateJoinAlias('chat');          // ex: m_chat
    $storyAlias  = $gen->generateJoinAlias('story');         // ex: m_chat_story
    $memberAlias = $gen->generateJoinAlias('member');        // ex: m_chat_story_member

    // Joins nécessaires pour tester membership/auteur
    $qb->join("$root.chat", $chatAlias)
      ->join("$chatAlias.story", $storyAlias)
      ->join("$storyAlias.members", $memberAlias);

    // Récupère l'id du chat depuis la subresource /chats/{id}/messages
    // API Platform 3 met ça dans $context['uri_variables']
    $chatId = null;
    if (isset($context['uri_variables']['id'])) {
      $chatId = (int) $context['uri_variables']['id'];
    }

    // 1) Si on est sur /chats/{id}/messages, force le chat ciblé
    if ($chatId) {
      $qb->andWhere("$chatAlias.id = :chatId")
        ->setParameter('chatId', $chatId);
    }

    // 2) (membre accepté du chat) OU (auteur de la story)
    $expr = $qb->expr();
    $isMemberAccepted = $expr->andX(
      $expr->eq("$memberAlias.memberUser", ':user'),
      $expr->eq("$memberAlias.isAccepted", ':accepted')
    );
    $isStoryAuthor = $expr->eq("$storyAlias.author", ':user');

    $qb->andWhere($expr->orX($isMemberAccepted, $isStoryAuthor))
      ->setParameter('user', $user)
      ->setParameter('accepted', true);
  }
}
