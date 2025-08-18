<?php

namespace App\State;

use App\Entity\Chat;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;

final class ChatStateProvider implements ProviderInterface
{
  public function __construct(private EntityManagerInterface $em) {}

  public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
  {
    $id = $uriVariables['id'] ?? null;
    if (!$id) {
      return null;
    }

    $qb = $this->em->createQueryBuilder()
      ->select('partial c.{id}')
      ->from(Chat::class, 'c')

      ->leftJoin('c.currentPlace', 'cp')
      ->addSelect('partial cp.{id, title, placeImageUrl}')

      ->leftJoin('c.story', 's')
      ->addSelect('partial s.{id, title}')
      ->leftJoin('s.places', 'sp')
      ->addSelect('partial sp.{id, title, placeImageUrl}')

      ->leftJoin('c.members', 'm')
      ->addSelect('partial m.{id}')
      ->leftJoin('m.memberUser', 'mu')
      ->addSelect('partial mu.{id, avatarUrl, username}')
      ->leftJoin('m.memberChatStatus', 'mcs')
      ->addSelect('partial mcs.{id, isOnline, isWriting}')

      ->andWhere('c.id = :id')
      ->setParameter('id', $id)
      ->distinct();

    $query = $qb->getQuery();
    $query->setHint(\Doctrine\ORM\Query::HINT_FORCE_PARTIAL_LOAD, true);

    return $query->getOneOrNullResult();
  }
}
