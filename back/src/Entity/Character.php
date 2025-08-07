<?php

namespace App\Entity;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use App\State\CharacterStateProcessor;
use ApiPlatform\Metadata\GetCollection;
use App\Repository\CharacterRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CharacterRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['read']],
    denormalizationContext: ['groups' => ['write']],
    operations: [
        new Get(
            security: "is_granted('ROLE_USER')"
        ),
        new GetCollection(
            uriTemplate: '/users/{id}/characters',
            uriVariables: [
                'id' => new Link(
                    fromClass: User::class,
                    fromProperty: 'characters',
                    security: "is_granted('ROLE_USER')"
                )
            ]
        ),
        new GetCollection(
            uriTemplate: '/stories/{id}/characters',
            uriVariables: [
                'id' => new Link(
                    fromClass: Story::class,
                    fromProperty: 'characters',
                    toClass: self::class,
                    toProperty: 'usedInStories',
                    security: "is_granted('ROLE_USER')"
                )
            ]
        ),
        new Post(
            processor: CharacterStateProcessor::class,
            security: "is_granted('ROLE_USER')",
            validationContext: ['groups' => ['create']],
            denormalizationContext: ['groups' => ['create_write']]
        ),
        new Patch(
            processor: CharacterStateProcessor::class,
            security: "is_granted('POST_EDIT', object)",
            validationContext: ['groups' => ['edit']],
            denormalizationContext: ['groups' => ['edit_write']]
        ),
        new Delete(
            security: "is_granted('POST_DELETE', object)"
        )
    ]
)]
class Character
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups('read')]
    private ?int $id = null;

    #[ORM\Column(length: 6, nullable: true)]
    #[Groups('read')]
    private ?string $hashId = null;

    #[ORM\Column(length: 30)]
    #[Assert\NotBlank(
        message: 'Character name cannot be blank.',
        groups: ['create', 'edit']
    )]
    #[Assert\Length(
        min: 1,
        max: 30,
        minMessage: 'Character name must be at least {{ limit }} character long.',
        maxMessage: 'Character name cannot be longer than {{ limit }} characters.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/<[^>]*>/',
        match: false,
        message: 'HTML tags are not allowed in the title.',
        groups: ['create', 'edit']
    )]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $name = null;

    #[ORM\Column(length: 40, nullable: true)]
    #[Assert\Length(
        max: 40,
        maxMessage: 'Title cannot be longer than {{ limit }} characters.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/<[^>]*>/',
        match: false,
        message: 'HTML tags are not allowed in the title.',
        groups: ['create', 'edit']
    )]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(
        max: 2000,
        maxMessage: 'Biography cannot be longer than {{ limit }} characters.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/<[^>]*>/',
        match: false,
        message: 'HTML tags are not allowed in the title.',
        groups: ['create', 'edit']
    )]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $bio = null;

    #[ORM\Column(length: 255)]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $portraitUrl = null;

    #[ORM\Column(length: 255)]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $avatarUrl = null;

    #[ORM\ManyToOne(inversedBy: 'characters')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['read'])]
    private ?User $owner = null;

    /**
     * @var Collection<int, Story>
     */
    #[ORM\ManyToMany(targetEntity: Story::class, inversedBy: 'characters')]
    private Collection $usedInStories;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'characterAlias')]
    private Collection $usedInMessages;

    public function __construct()
    {
        $this->usedInStories = new ArrayCollection();
        $this->usedInMessages = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getHashId(): ?string
    {
        return $this->hashId;
    }

    public function setHashId(string $hashId): static
    {
        $this->hashId = $hashId;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;

        return $this;
    }

    public function getPortraitUrl(): ?string
    {
        return $this->portraitUrl;
    }

    public function setPortraitUrl(string $portraitUrl): static
    {
        $this->portraitUrl = $portraitUrl;

        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function setAvatarUrl(string $avatarUrl): static
    {
        $this->avatarUrl = $avatarUrl;

        return $this;
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;

        return $this;
    }

    /**
     * @return Collection<int, Story>
     */
    public function getUsedInStories(): Collection
    {
        return $this->usedInStories;
    }

    public function addUsedInStory(Story $usedInStory): static
    {
        if (!$this->usedInStories->contains($usedInStory)) {
            $this->usedInStories->add($usedInStory);
        }

        return $this;
    }

    public function removeUsedInStory(Story $usedInStory): static
    {
        $this->usedInStories->removeElement($usedInStory);

        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getUsedInMessages(): Collection
    {
        return $this->usedInMessages;
    }

    public function addUsedInMessage(Message $usedInMessage): static
    {
        if (!$this->usedInMessages->contains($usedInMessage)) {
            $this->usedInMessages->add($usedInMessage);
            $usedInMessage->setCharacterAlias($this);
        }

        return $this;
    }

    public function removeUsedInMessage(Message $usedInMessage): static
    {
        if ($this->usedInMessages->removeElement($usedInMessage)) {
            // set the owning side to null (unless already changed)
            if ($usedInMessage->getCharacterAlias() === $this) {
                $usedInMessage->setCharacterAlias(null);
            }
        }

        return $this;
    }
}
