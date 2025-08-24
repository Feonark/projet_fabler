<?php

namespace App\State;

use App\Entity\Story;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;

final class StoryStateProvider implements ProviderInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        // On vise l'item: /stories/{id}
        $id = $uriVariables['id'] ?? null;
        if (!$id) {
            return null;
        }

        $qb = $this->em->createQueryBuilder()
            ->select('partial s.{id, title, description, bannerImageUrl, isPublic, genreType, audienceType, accessType, languageType}')
            ->from(Story::class, 's')
            ->leftJoin('s.author', 'a')
            ->addSelect('partial a.{id, username, avatarUrl}')
            ->leftJoin('s.members', 'm')
            ->addSelect('partial m.{id, isAccepted, isAuthor}')
            ->leftJoin('m.memberUser', 'mu')
            ->addSelect('partial mu.{id, username, avatarUrl}')
            ->leftJoin('s.places', 'p')
            ->addSelect('partial p.{id, title, description, placeImageUrl}')
            ->andWhere('s.id = :id')
            ->setParameter('id', $id)
            ->distinct() // évite les doublons lors de l’hydratation des collections
        ;

        $query = $qb->getQuery();
        $query->setHint(\Doctrine\ORM\Query::HINT_FORCE_PARTIAL_LOAD, true);
        return $query->getOneOrNullResult();
    }
}
