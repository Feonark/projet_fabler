<?php

namespace App\State;

use App\Entity\User;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<User|null>
 */
final class MeStateProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?User
    {
        $currentUser = $this->security->getUser();

        if (!$currentUser instanceof User) {
            return null;
        }

        return $this->em->createQueryBuilder()
            ->select('partial u.{id, username, email}')
            ->from(User::class, 'u')
            ->where('u.id = :id')
            ->setParameter('id', $currentUser->getId())
            ->getQuery()
            ->getSingleResult();
    }
}
