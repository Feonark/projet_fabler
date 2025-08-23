<?php

namespace App\State;

use Sqids\Sqids;
use App\Entity\Place;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class PlaceStateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security $security,
        private Sqids $sqids
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Place
    {
        if (!$data instanceof Place) {
            return $data;
        }

        $method = $context['request']?->getMethod();
        $user = $this->security->getUser();
        $story = $data->getStory();

        if ($method === 'POST') {

            if (!$user || !$story) {
                return $data;
            }

            if ($story->getPlaces()->count() >= 10) {
                throw new BadRequestHttpException('This story already got 10 places.');
            }

            $this->entityManager->persist($data);
            $this->entityManager->flush();

            $hashId = $this->sqids->encode([$data->getId()]);
            $data->setHashId($hashId);

            $this->entityManager->flush();

            return $data;
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
