<?php

namespace App\Entity;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Patch;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\MemberChatStatusRepository;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[ORM\Entity(repositoryClass: MemberChatStatusRepository::class)]
#[ApiResource(
    mercure: 'object.getMercureOptions()',
    normalizationContext: ['groups' => ['status:read', 'chat:item:read']],
    denormalizationContext: ['groups' => ['status:edit']],
    operations: [
        new Patch(
            normalizationContext: ['groups' => ['status:read']],
            denormalizationContext: ['groups' => ['status:edit']],
        )
    ]
)]
class MemberChatStatus
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['status:read', 'chat:item:read'])]
    private ?int $id = null;

    #[ORM\Column]
    private ?bool $isOnline = null;

    #[ORM\Column]
    private ?bool $isWriting = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    #[Groups(['status:read', 'chat:item:read'])]
    public function isOnline(): ?bool
    {
        return $this->isOnline;
    }

    #[Groups(['status:edit'])]
    public function setIsOnline(bool $isOnline): static
    {
        $this->isOnline = $isOnline;

        return $this;
    }

    #[Groups(['status:read', 'chat:item:read'])]
    public function isWriting(): ?bool
    {
        return $this->isWriting;
    }

    #[Groups(['status:edit'])]
    public function setIsWriting(bool $isWriting): static
    {
        $this->isWriting = $isWriting;

        return $this;
    }

    public function getMercureOptions(): array
    {
        $topic = '@=iri(object)';

        return [
            'private' => true,
            'topics' => [$topic],
        ];
    }
}
