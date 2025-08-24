<?php

namespace App\State;

use Sqids\Sqids;
use App\Entity\Chat;
use App\Entity\Story;
use App\Entity\StoryMember;
use App\Entity\MemberChatStatus;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Bundle\SecurityBundle\Security;

class StoryStateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security $security,
        private Sqids $sqids
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Story
    {
        if (!$data instanceof Story) {
            return $data;
        }

        $method = $context['request']?->getMethod();
        $user = $this->security->getUser();

        if ($method === 'POST') {
            // D'abord, je mets l'utilisateur qui créée la story en auteur
            $data->setAuthor($user);

            if (!$data->getBannerImageUrl()) {
                $data->setBannerImageUrl('/uploads/banners/banner-default.jpg');
            }

            $this->entityManager->persist($data);
            $this->entityManager->flush();

            $hashId = $this->sqids->encode([$data->getId()]);
            $data->setHashId($hashId);

            // Ensuite, je crée le chat lié à la story
            $chat = new Chat();
            $chat->setStory($data);
            $data->setChat($chat);

            // L'auteur de la story obtient le rôle Storymember comme tout le monde
            $storyMember = new StoryMember();
            $storyMember
                ->setMemberUser($user)
                ->setStory($data)
                ->setIsAuthor(true)
                ->setIsAccepted(true)
                ->setChat($chat)
            ;
            $data->addMember($storyMember);

            // La création d'un Storymember entraîne la création d'un MemberChatStatus
            $memberChatStatus = new MemberChatStatus;
            $memberChatStatus
                ->setIsOnline(false)
                ->setIsWriting(false)
            ;
            $storyMember->setMemberChatStatus($memberChatStatus);

            $this->entityManager->persist($storyMember);
            $this->entityManager->persist($memberChatStatus);
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
