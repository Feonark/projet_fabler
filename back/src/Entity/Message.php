<?php

namespace App\Entity;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use App\State\MessageStateProcessor;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\MessageRepository;
use ApiPlatform\Metadata\GetCollection;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: MessageRepository::class)]
#[ApiResource(
    mercure: true,
    normalizationContext: ['groups' => ['read']],
    denormalizationContext: ['groups' => ['write']],
    operations: [
        new Get(),
        new GetCollection(
            uriTemplate: '/chat/{id}/messages',
            uriVariables: [
                'id' => new Link(
                    fromClass: Chat::class,
                    fromProperty: 'messages'
                )
            ]
        ),
        new Post(
            // processor: MessageStateProcessor::class,
            securityPostDenormalize: "is_granted('MESSAGE_CREATE', object)",
            validationContext: ['groups' => ['create']],
            denormalizationContext: ['groups' => ['create_write']]
        ),
        new Delete(
            security: "is_granted('MESSAGE_DELETE', object)"
        )
    ]
)]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups('read')]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank(
        groups: ['create']
    )]
    #[Assert\Length(
        max: 400,
        maxMessage: 'Message content cannot be longer than {{ limit }} characters.',
        groups: ['create']
    )]
    #[Groups(['read', 'create_write'])]
    private ?string $content = null;

    #[ORM\Column(type: Types::TIME_IMMUTABLE)]
    #[Groups(['read', 'create_write'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'usedInMessages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['read', 'create_write'])]
    #[ApiProperty(readableLink: false, writableLink: false)]
    private ?Character $characterAlias = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['read', 'create_write'])]
    #[ApiProperty(readableLink: false, writableLink: false)]
    private ?StoryMember $author = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['read', 'create_write'])]
    #[ApiProperty(readableLink: false, writableLink: false)]
    private ?Chat $chat = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCharacterAlias(): ?Character
    {
        return $this->characterAlias;
    }

    public function setCharacterAlias(?Character $characterAlias): static
    {
        $this->characterAlias = $characterAlias;

        return $this;
    }

    public function getAuthor(): ?StoryMember
    {
        return $this->author;
    }

    public function setAuthor(?StoryMember $author): static
    {
        $this->author = $author;

        return $this;
    }

    public function getChat(): ?Chat
    {
        return $this->chat;
    }

    public function setChat(?Chat $chat): static
    {
        $this->chat = $chat;

        return $this;
    }
}
