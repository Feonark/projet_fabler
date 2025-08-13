<?php

namespace App\State;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Bundle\SecurityBundle\Security;

final class UserProfileStateProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            return null;
        }

        $qb = $this->em->createQueryBuilder()
            ->select('partial u.{id, username, birthdate, description}')
            ->from(User::class, 'u')
            ->leftJoin('u.characters', 'c')
            ->addSelect('partial c.{id, name, title}')
            ->leftJoin('u.storyMemberships', 'sm')
            ->addSelect('partial sm.{id, isAuthor}')
            ->leftJoin('sm.story', 's')
            ->addSelect('partial s.{id, title, bannerImageUrl}')
            ->andWhere('u.id = :id')
            ->setParameter('id', $currentUser->getId())
            ->distinct();

        $query = $qb->getQuery();
        $query->setHint(\Doctrine\ORM\Query::HINT_FORCE_PARTIAL_LOAD, true);
        return $query->getOneOrNullResult();
}
}
