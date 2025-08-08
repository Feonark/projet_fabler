<?php

namespace App\State;

use App\Entity\User;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProviderInterface<User|null>
 */
final class MeProvider implements ProviderInterface
{
    public function __construct(private Security $security) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?User
    {
        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return null;
        }

        return $user; // La sérialisation utilisera les @Groups définis dans User
    }
}
